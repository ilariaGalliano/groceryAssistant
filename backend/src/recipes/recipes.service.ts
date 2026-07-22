import { Injectable } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { Recipe } from './recipe.schema';
import { AiService } from '../ai/ai.service';

@Injectable()
export class RecipesService {
  constructor(
    @InjectModel(Recipe.name) private recipeModel: Model<Recipe>,
    @InjectConnection() private connection: Connection,
    private aiService: AiService,
  ) {}

  /**
   * Flusso completo:
   * 1. OpenAI interpreta la richiesta
   * 2. MongoDB Vector Search cerca ricette simili
   * 3. AI genera versione vegetariana
   * 4. Ritorna tutto per la UI dinamica
   */
  async processRequest(text: string, userId: string, preferences?: { diets?: string[]; budget?: string; mealType?: string }) {
    // Step 1: Gemini interpreta la richiesta (1 chiamata totale per request)
    const parsedRecipes = await this.aiService.parseRecipes(text, preferences);

    // Step 2: Per ogni ricetta, cerca simili con Vector Search
    const results = await Promise.all(
      parsedRecipes.map(async (recipe) => {
        const ingredients = await this.aiService.getIngredients([recipe], preferences);

        // Genera embedding per la ricetta (può essere null se Gemini non è disponibile)
        const recipeText = `${recipe.name} ${ingredients.map((i) => i.ingredient).join(' ')}`;
        const embedding = await this.aiService.generateEmbedding(recipeText);

        // Salva la ricetta in MongoDB (embedding solo se disponibile)
        const recipeUpdate: Record<string, unknown> = {
          name: recipe.name,
          people: recipe.people,
          ingredients,
          description: `${recipe.name} per ${recipe.people} persone`,
          userId,
        };
        if (embedding !== null) recipeUpdate.embedding = embedding;

        const savedRecipe = await this.recipeModel.findOneAndUpdate(
          { name: recipe.name, people: recipe.people, userId },
          recipeUpdate,
          { upsert: true, new: true },
        );

        // Vector Search: eseguito solo se l'embedding è disponibile
        const similarRecipes = embedding !== null
          ? await this.vectorSearch(embedding, String(savedRecipe._id), userId)
          : [];

        // Step 3: Genera versione vegetariana (deterministica)
        const vegetarianVersion = await this.aiService.generateVegetarianVersion({
          name: recipe.name,
          ingredients,
        });

        // Salva la versione vegetariana
        const vegEmbeddingText = `${vegetarianVersion.name} vegetariana ${vegetarianVersion.ingredients.map((i) => i.ingredient).join(' ')}`;
        const vegEmbedding = await this.aiService.generateEmbedding(vegEmbeddingText);

        const vegUpdate: Record<string, unknown> = {
          name: vegetarianVersion.name,
          people: recipe.people,
          ingredients: vegetarianVersion.ingredients,
          description: vegetarianVersion.description,
          isVegetarian: true,
          originalRecipeId: String(savedRecipe._id),
          userId,
        };
        if (vegEmbedding !== null) vegUpdate.embedding = vegEmbedding;

        await this.recipeModel.findOneAndUpdate(
          { name: vegetarianVersion.name, isVegetarian: true, userId },
          vegUpdate,
          { upsert: true, new: true },
        );

        return {
          original: {
            name: recipe.name,
            people: recipe.people,
            ingredients,
          },
          similarRecipes,
          vegetarianVersion,
        };
      }),
    );

    return { recipes: results };
  }

  /**
   * MongoDB Atlas Vector Search
   * Cerca ricette con embedding simili usando $vectorSearch
   */
  async vectorSearch(queryEmbedding: number[], excludeId?: string, userId?: string): Promise<any[]> {
    try {
      const collection = this.connection.collection('recipes');

      const pipeline: any[] = [
        {
          $vectorSearch: {
            index: 'recipe_vector_index',
            path: 'embedding',
            queryVector: queryEmbedding,
            numCandidates: 50,
            limit: 5,
          },
        },
        ...(userId ? [{ $match: { userId } }] : []),
        {
          $project: {
            name: 1,
            ingredients: 1,
            description: 1,
            isVegetarian: 1,
            people: 1,
            score: { $meta: 'vectorSearchScore' },
          },
        },
      ];

      // Escludi la ricetta corrente dai risultati
      if (excludeId) {
        pipeline.push({
          $match: { _id: { $ne: excludeId } },
        });
      }

      const results = await collection.aggregate(pipeline).toArray();
      return results;
    } catch (error) {
      // Se Vector Search non è configurato (es. in-memory DB), ritorna array vuoto
      console.warn('⚠️  Vector Search non disponibile:', error.message);
      return this.fallbackSimilarSearch(excludeId, userId);
    }
  }

  /**
   * Fallback: ricerca semplice quando Vector Search non è disponibile
   */
  private async fallbackSimilarSearch(excludeId?: string, userId?: string): Promise<any[]> {
    const query: any = {};
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    if (userId) {
      query.userId = userId;
    }

    return this.recipeModel
      .find(query)
      .select('name ingredients description isVegetarian people')
      .limit(5)
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  async searchSimilar(text: string, userId: string) {
    const embedding = await this.aiService.generateEmbedding(text);
    if (embedding === null) return [];
    return this.vectorSearch(embedding, undefined, userId);
  }

  async getAllRecipes(userId: string) {
    return this.recipeModel
      .find({ userId })
      .select('-embedding')
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }
}
