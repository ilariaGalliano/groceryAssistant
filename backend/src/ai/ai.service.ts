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
        const prompt = `Sei un assistente che analizza testo in linguaggio naturale e estrae ricette.
Rispondi SOLO con un JSON array valido. Ogni elemento ha "name" (nome ricetta) e "people" (numero persone, default 2).
Esempio: [{"name": "Carbonara", "people": 4}]

Testo: ${text}`;
        
        const result = await this.gemini.generateContent(prompt);
        const content = result.response.text().replace(/```json\n?|```\n?/g, '').trim();
        return JSON.parse(content);
      } catch (error) {
        console.warn('⚠️  Gemini parseRecipes fallito, uso mock:', error);
      }
    }

    // Mock: parsing semplice dal testo
    return this.mockParseRecipes(text);
  }

  async getIngredients(
    recipes: { name: string; people: number }[],
  ): Promise<{ ingredient: string; quantity: number; unit: string; category: string }[]> {
    if (this.gemini) {
      try {
        const prompt = `Sei un assistente culinario. Data una lista di ricette, restituisci gli ingredienti necessari.
Rispondi SOLO con un JSON array. Ogni elemento ha:
- "ingredient": nome ingrediente
- "quantity": quantità numerica
- "unit": unità di misura (g, ml, pz, cucchiai, ecc.)
- "category": categoria (carne, latticini, verdure, pasta, spezie, frutta, pesce, altro)

REGOLE IMPORTANTI:
1. Se lo stesso ingrediente appare in più ricette, SOMMA le quantità e restituiscilo una sola volta.
2. Se il nome ricetta contiene "Vegetariana" o "Vegetariano": NON includere MAI carne (guanciale, pancetta, prosciutto, salsiccia, ecc.) o pesce. Usa alternative vegetariane (es: zucchine grigliate, funghi, tofu affumicato).
3. Se il nome ricetta contiene "Vegana" o "Vegano": NON includere MAI prodotti animali (carne, pesce, uova, latticini, burro, formaggio). Usa alternative vegane.

Ricette: ${JSON.stringify(recipes)}`;
        
        const result = await this.gemini.generateContent(prompt);
        const content = result.response.text().replace(/```json\n?|```\n?/g, '').trim();
        return JSON.parse(content);
      } catch (error) {
        console.warn('⚠️  Gemini getIngredients fallito, uso mock:', error);
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
    if (this.gemini) {
      try {
        const prompt = `Sei un chef esperto di cucina vegetariana. Data una ricetta, crea una versione vegetariana.
Rispondi SOLO con un JSON con:
- "name": nome della versione vegetariana
- "description": breve descrizione della variante
- "ingredients": array con { "ingredient", "quantity" (numero), "unit", "category" }

Sostituisci carne/pesce con alternative vegetariane mantenendo sapore e consistenza simili.

Ricetta: ${JSON.stringify(recipe)}`;
        
        const result = await this.gemini.generateContent(prompt);
        const content = result.response.text().replace(/```json\n?|```\n?/g, '').trim();
        return JSON.parse(content);
      } catch (error) {
        console.warn('⚠️  Gemini vegetarian fallito, uso mock:', error);
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
