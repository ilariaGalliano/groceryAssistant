import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { RECIPES_DATASET, findRecipeByName, generateEmbeddingText, RecipeData } from '../data/recipes-dataset';

@Injectable()
export class AiService {
  private openai: OpenAI | null = null;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (apiKey && !apiKey.includes('your-openai')) {
      this.openai = new OpenAI({ apiKey });
    } else {
      console.log('⚠️  OpenAI API key non configurata. Uso mock AI con golden dataset.');
    }
  }

  async parseRecipes(text: string): Promise<{ name: string; people: number }[]> {
    if (this.openai) {
      try {
        const response = await this.openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `Sei un assistente che analizza testo in linguaggio naturale e estrae ricette.
Rispondi SOLO con un JSON array valido. Ogni elemento ha "name" (nome ricetta) e "people" (numero persone, default 2).
Esempio: [{"name": "Carbonara", "people": 4}]`,
            },
            { role: 'user', content: text },
          ],
          temperature: 0.3,
        });
        const content = response.choices[0]?.message?.content || '[]';
        return JSON.parse(content);
      } catch (error) {
        console.warn('⚠️  OpenAI parseRecipes fallito, uso mock:', error);
      }
    }

    // Mock: parsing semplice dal testo
    return this.mockParseRecipes(text);
  }

  async getIngredients(
    recipes: { name: string; people: number }[],
  ): Promise<{ ingredient: string; quantity: number; unit: string; category: string }[]> {
    if (this.openai) {
      try {
        const response = await this.openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `Sei un assistente culinario. Data una lista di ricette, restituisci gli ingredienti necessari.
Rispondi SOLO con un JSON array. Ogni elemento ha:
- "ingredient": nome ingrediente
- "quantity": quantità numerica
- "unit": unità di misura (g, ml, pz, cucchiai, ecc.)
- "category": categoria (carne, latticini, verdure, pasta, spezie, frutta, pesce, altro)

IMPORTANTE: Se lo stesso ingrediente appare in più ricette, SOMMA le quantità e restituiscilo una sola volta.`,
            },
            { role: 'user', content: JSON.stringify(recipes) },
          ],
          temperature: 0.3,
        });
        const content = response.choices[0]?.message?.content || '[]';
        return JSON.parse(content);
      } catch (error) {
        console.warn('⚠️  OpenAI getIngredients fallito, uso mock:', error);
      }
    }

    // Mock: usa database locale di ricette
    return this.mockGetIngredients(recipes);
  }

  private mockParseRecipes(text: string): { name: string; people: number }[] {
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

    if (recipes.length === 0) {
      recipes.push({ name: 'Carbonara', people: 4 });
    }
    return recipes;
  }

  private mockGetIngredients(
    recipes: { name: string; people: number }[],
  ): { ingredient: string; quantity: number; unit: string; category: string }[] {
    const merged: Record<string, { ingredient: string; quantity: number; unit: string; category: string }> = {};

    for (const recipe of recipes) {
      // Cerca nel golden dataset
      const datasetRecipe = findRecipeByName(recipe.name);
      
      if (!datasetRecipe) {
        console.warn(`⚠️  Ricetta "${recipe.name}" non trovata nel dataset. Usa fallback generico.`);
        // Fallback: restituisci ingredienti generici per ricetta sconosciuta
        return [
          { ingredient: 'ingrediente principale', quantity: 500, unit: 'g', category: 'altro' },
          { ingredient: 'condimento', quantity: 100, unit: 'g', category: 'altro' },
        ];
      }

      const scale = recipe.people / datasetRecipe.basePeople;

      for (const ing of datasetRecipe.ingredients) {
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
    if (this.openai) {
      try {
        const response = await this.openai.embeddings.create({
          model: 'text-embedding-3-small',
          input: text,
        });
        return response.data[0].embedding;
      } catch (error) {
        console.warn('⚠️  OpenAI embedding fallito, uso mock:', error);
      }
    }

    // Mock: genera un vettore finto per sviluppo
    return Array.from({ length: 1536 }, () => Math.random() * 2 - 1);
  }

  async generateVegetarianVersion(
    recipe: { name: string; ingredients: { ingredient: string; quantity: number; unit: string; category: string }[] },
  ): Promise<{ name: string; ingredients: { ingredient: string; quantity: number; unit: string; category: string }[]; description: string }> {
    if (this.openai) {
      try {
        const response = await this.openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `Sei un chef esperto di cucina vegetariana. Data una ricetta, crea una versione vegetariana.
Rispondi SOLO con un JSON con:
- "name": nome della versione vegetariana
- "description": breve descrizione della variante
- "ingredients": array con { "ingredient", "quantity" (numero), "unit", "category" }

Sostituisci carne/pesce con alternative vegetariane mantenendo sapore e consistenza simili.`,
            },
            { role: 'user', content: JSON.stringify(recipe) },
          ],
          temperature: 0.7,
        });
        const content = response.choices[0]?.message?.content || '{}';
        return JSON.parse(content);
      } catch (error) {
        console.warn('⚠️  OpenAI vegetarian fallito, uso mock:', error);
      }
    }

    // Mock: versione vegetariana
    return this.mockVegetarianVersion(recipe);
  }

  private mockVegetarianVersion(
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
