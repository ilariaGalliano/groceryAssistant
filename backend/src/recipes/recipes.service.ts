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
  async processRequest(text: string) {
    // Step 1: OpenAI interpreta la richiesta
    const parsedRecipes = await this.aiService.parseRecipes(text);

    // Step 2: Per ogni ricetta, cerca simili con Vector Search
    const results = await Promise.all(
      parsedRecipes.map(async (recipe) => {
        const ingredients = await this.aiService.getIngredients([recipe]);

        // Genera embedding per la ricetta
        const recipeText = `${recipe.name} ${ingredients.map((i) => i.ingredient).join(' ')}`;
        const embedding = await this.aiService.generateEmbedding(recipeText);

        // Salva la ricetta con embedding in MongoDB
        const savedRecipe = await this.recipeModel.findOneAndUpdate(
          { name: recipe.name, people: recipe.people },
          {
            name: recipe.name,
            people: recipe.people,
            ingredients,
            embedding,
            description: `${recipe.name} per ${recipe.people} persone`,
          },
          { upsert: true, new: true },
        );

        // Vector Search: cerca ricette semanticamente simili
        const similarRecipes = await this.vectorSearch(embedding, String(savedRecipe._id));

        // Step 3: Genera versione vegetariana
        const vegetarianVersion = await this.aiService.generateVegetarianVersion({
          name: recipe.name,
          ingredients,
        });

        // Salva la versione vegetariana
        const vegEmbeddingText = `${vegetarianVersion.name} vegetariana ${vegetarianVersion.ingredients.map((i) => i.ingredient).join(' ')}`;
        const vegEmbedding = await this.aiService.generateEmbedding(vegEmbeddingText);

        await this.recipeModel.findOneAndUpdate(
          { name: vegetarianVersion.name, isVegetarian: true },
          {
            name: vegetarianVersion.name,
            people: recipe.people,
            ingredients: vegetarianVersion.ingredients,
            embedding: vegEmbedding,
            description: vegetarianVersion.description,
            isVegetarian: true,
            originalRecipeId: String(savedRecipe._id),
          },
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
  async vectorSearch(queryEmbedding: number[], excludeId?: string): Promise<any[]> {
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
      return this.fallbackSimilarSearch(excludeId);
    }
  }

  /**
   * Fallback: ricerca semplice quando Vector Search non è disponibile
   */
  private async fallbackSimilarSearch(excludeId?: string): Promise<any[]> {
    const query: any = {};
    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    return this.recipeModel
      .find(query)
      .select('name ingredients description isVegetarian people')
      .limit(5)
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  /**
   * Cerca ricette per testo usando Vector Search semantico
   */
  async searchSimilar(text: string) {
    const embedding = await this.aiService.generateEmbedding(text);
    return this.vectorSearch(embedding);
  }

  async getAllRecipes() {
    return this.recipeModel
      .find()
      .select('-embedding')
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }
}
