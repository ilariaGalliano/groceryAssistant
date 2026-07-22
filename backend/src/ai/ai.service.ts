import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { RECIPES_DATASET, findRecipeByName, generateEmbeddingText, RecipeData } from '../data/recipes-dataset';

@Injectable()
export class AiService {
  private gemini: GenerativeModel | null = null;
  private genAI: GoogleGenerativeAI | null = null;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (apiKey && apiKey.length > 10) {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.gemini = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      console.log('✅ Gemini AI configurato correttamente.');
    } else {
      console.log('⚠️  Gemini API key non configurata. Uso mock AI.');
    }
  }

  async parseRecipes(text: string): Promise<{ name: string; people: number }[]> {
    if (this.gemini) {
      try {
        const prompt = `Sei un assistente che analizza testo in linguaggio naturale e estrae ricette italiane.
Rispondi SOLO con un JSON array valido senza markdown. Ogni elemento ha:
- "name": nome della ricetta (stringa non vuota)
- "people": numero intero di persone (default 2, minimo 1)
Esempio: [{"name": "Carbonara", "people": 4}]

Se non riesci a identificare ricette, rispondi con []

Testo: ${text}`;

        const result = await this.gemini.generateContent(prompt);
        const raw = result.response.text();
        // Estrai il primo array JSON dalla risposta (gestisce markdown code fences e testo extra)
        const match = raw.match(/\[[\s\S]*?\]/);
        if (match) {
          const validated = this.validateRecipeList(JSON.parse(match[0]));
          if (validated) return validated;
        }
      } catch (error) {
        console.warn('⚠️  Gemini parseRecipes fallito, uso fallback:', error);
      }
    }

    return this.fallbackParseRecipes(text);
  }

  private validateRecipeList(parsed: unknown): { name: string; people: number }[] | null {
    if (!Array.isArray(parsed)) return null;
    const result = parsed
      .filter((r): r is Record<string, unknown> => r !== null && typeof r === 'object' && typeof (r as any).name === 'string' && (r as any).name.trim().length > 0)
      .map(r => ({
        name: (r.name as string).trim(),
        people: Math.min(Math.max(Math.round(Number.isFinite(Number(r.people)) ? Number(r.people) : 2), 1), 50),
      }));
    return result.length > 0 ? result : null;
  }

  async getIngredients(
    recipes: { name: string; people: number }[],
  ): Promise<{ ingredient: string; quantity: number; unit: string; category: string }[]> {
    // Calcolo deterministico dal dataset — nessuna chiamata AI
    return this.datasetGetIngredients(recipes);
  }

  private fallbackParseRecipes(text: string): { name: string; people: number }[] {
    const recipes: { name: string; people: number }[] = [];
    const lower = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    // Cerca numero di persone nel testo
    const peopleMatch = lower.match(/(\d+)\s*person[ei]?/);
    const people = peopleMatch ? parseInt(peopleMatch[1]) : 4;

    // Cerca TUTTE le ricette dal golden dataset
    for (const datasetRecipe of RECIPES_DATASET) {
      const recipeName = datasetRecipe.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      // Match esatto o parziale
      if (lower.includes(recipeName) || recipeName.split(' ').some(word => word.length > 4 && lower.includes(word))) {
        // Evita duplicati
        if (!recipes.some(r => r.name === datasetRecipe.name)) {
          recipes.push({ name: datasetRecipe.name, people });
        }
      }
    }

    // Se non troviamo ricette note, cerchiamo pattern "cucinare/fare una/un [ricetta]"
    if (recipes.length === 0) {
      const recipePattern = lower.match(/(?:cucinare|fare|preparare)\s+(?:una?|il|la|lo)\s+([a-z]+(?:\s+[a-z']+)?)/i);
      if (recipePattern) {
        const extractedName = recipePattern[1];
        // Cerca nel dataset
        const found = findRecipeByName(extractedName);
        if (found) {
          recipes.push({ name: found.name, people });
        } else {
          // Nome non trovato, usa il nome estratto
          const name = extractedName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
          recipes.push({ name, people });
        }
      }
    }

    return recipes;
  }

  private datasetGetIngredients(
    recipes: { name: string; people: number }[],
  ): { ingredient: string; quantity: number; unit: string; category: string }[] {
    const merged: Record<string, { ingredient: string; quantity: number; unit: string; category: string }> = {};

    // Ingredienti da escludere per versioni vegetariane/vegane
    const meatIngredients = ['guanciale', 'pancetta', 'prosciutto', 'salsiccia', 'bacon', 'lardo', 'speck', 'bresaola', 'salame'];
    const animalIngredients = [...meatIngredients, 'uova', 'uovo', 'parmigiano', 'pecorino', 'grana', 'burro', 'panna', 'latte', 'mozzarella', 'ricotta'];
    
    // Sostituzioni vegetariane
    const vegetarianReplacements: Record<string, { ingredient: string; quantity: number; unit: string; category: string }> = {
      'guanciale': { ingredient: 'zucchine grigliate', quantity: 200, unit: 'g', category: 'verdure' },
      'pancetta': { ingredient: 'funghi champignon', quantity: 200, unit: 'g', category: 'verdure' },
      'prosciutto': { ingredient: 'zucchine', quantity: 150, unit: 'g', category: 'verdure' },
    };

    for (const recipe of recipes) {
      const recipeLower = recipe.name.toLowerCase();
      const isVegetarian = recipeLower.includes('vegetarian') || recipeLower.includes('vegano') || recipeLower.includes('vegana');
      const isVegan = recipeLower.includes('vegano') || recipeLower.includes('vegana') || recipeLower.includes('vegan');
      
      // Rimuovi suffissi per trovare la ricetta base
      const baseName = recipe.name
        .replace(/\s*(vegetarian[ao]?|vegan[ao]?)\s*/gi, '')
        .trim();
      
      // Cerca nel golden dataset (prima nome completo, poi nome base)
      let datasetRecipe = findRecipeByName(recipe.name) || findRecipeByName(baseName);
      
      if (!datasetRecipe) {
        console.warn(`⚠️  Ricetta "${recipe.name}" (base: "${baseName}") non trovata nel dataset. Usa fallback generico.`);
        // Fallback: restituisci ingredienti generici per ricetta sconosciuta
        return [
          { ingredient: 'ingrediente principale', quantity: 500, unit: 'g', category: 'altro' },
          { ingredient: 'condimento', quantity: 100, unit: 'g', category: 'altro' },
        ];
      }

      const scale = recipe.people / datasetRecipe.basePeople;

      for (const ing of datasetRecipe.ingredients) {
        const ingLower = ing.ingredient.toLowerCase();
        const excludeList = isVegan ? animalIngredients : (isVegetarian ? meatIngredients : []);
        
        // Salta ingredienti non permessi
        if (excludeList.some(excluded => ingLower.includes(excluded))) {
          // Aggiungi sostituto se disponibile
          const replacement = vegetarianReplacements[ingLower];
          if (replacement && !isVegan) {
            const id = replacement.ingredient;
            const scaledQuantity = Math.round(replacement.quantity * scale);
            if (merged[id]) {
              merged[id].quantity += scaledQuantity;
            } else {
              merged[id] = { ...replacement, quantity: scaledQuantity };
            }
          }
          continue;
        }
        
        const id = ing.ingredient;
        const scaledQuantity = Math.round(ing.quantity * scale);
        
        if (merged[id]) {
          merged[id].quantity += scaledQuantity;
        } else {
          merged[id] = { ...ing, quantity: scaledQuantity };
        }
      }
    }

    return Object.values(merged);
  }

  async generateEmbedding(text: string): Promise<number[]> {
    if (this.genAI) {
      try {
        const embeddingModel = this.genAI.getGenerativeModel({ model: 'embedding-001' });
        const result = await embeddingModel.embedContent(text);
        return result.embedding.values;
      } catch (error) {
        console.warn('⚠️  Gemini embedding fallito, uso mock:', error);
      }
    }

    // Mock: genera un vettore finto per sviluppo
    return Array.from({ length: 768 }, () => Math.random() * 2 - 1);
  }

  async generateVegetarianVersion(
    recipe: { name: string; ingredients: { ingredient: string; quantity: number; unit: string; category: string }[] },
  ): Promise<{ name: string; ingredients: { ingredient: string; quantity: number; unit: string; category: string }[]; description: string }> {
    // Versione vegetariana deterministica — nessuna chiamata AI
    return this.deterministicVegetarianVersion(recipe);
  }

  private deterministicVegetarianVersion(
    recipe: { name: string; ingredients: { ingredient: string; quantity: number; unit: string; category: string }[] },
  ): { name: string; ingredients: { ingredient: string; quantity: number; unit: string; category: string }[]; description: string } {
    const meatSubstitutes: Record<string, { ingredient: string; category: string }> = {
      guanciale: { ingredient: 'zucchine affumicate', category: 'verdure' },
      pancetta: { ingredient: 'tempeh affumicato', category: 'altro' },
      'ragù di carne': { ingredient: 'ragù di lenticchie', category: 'verdure' },
      prosciutto: { ingredient: 'funghi porcini', category: 'verdure' },
    };

    const vegIngredients = recipe.ingredients.map((ing) => {
      const sub = meatSubstitutes[ing.ingredient.toLowerCase()];
      if (sub || ing.category === 'carne') {
        return {
          ...ing,
          ingredient: sub?.ingredient || 'tofu',
          category: sub?.category || 'altro',
        };
      }
      return ing;
    });

    return {
      name: `${recipe.name} Vegetariana`,
      description: `Versione vegetariana della ${recipe.name} con sostituti a base vegetale.`,
      ingredients: vegIngredients,
    };
  }
}
