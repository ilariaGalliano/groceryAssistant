import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class AiService {
  private openai: OpenAI | null = null;

  // Database mock di ricette italiane per sviluppo senza API key
  private mockRecipes: Record<string, { ingredient: string; quantity: number; unit: string; category: string }[]> = {
    carbonara: [
      { ingredient: 'spaghetti', quantity: 400, unit: 'g', category: 'pasta' },
      { ingredient: 'guanciale', quantity: 200, unit: 'g', category: 'carne' },
      { ingredient: 'uova', quantity: 4, unit: 'pz', category: 'latticini' },
      { ingredient: 'pecorino romano', quantity: 100, unit: 'g', category: 'latticini' },
      { ingredient: 'pepe nero', quantity: 2, unit: 'cucchiaini', category: 'spezie' },
    ],
    tiramisu: [
      { ingredient: 'mascarpone', quantity: 500, unit: 'g', category: 'latticini' },
      { ingredient: 'uova', quantity: 4, unit: 'pz', category: 'latticini' },
      { ingredient: 'savoiardi', quantity: 300, unit: 'g', category: 'altro' },
      { ingredient: 'caffè espresso', quantity: 300, unit: 'ml', category: 'altro' },
      { ingredient: 'zucchero', quantity: 100, unit: 'g', category: 'altro' },
      { ingredient: 'cacao amaro', quantity: 30, unit: 'g', category: 'altro' },
    ],
    lasagna: [
      { ingredient: 'lasagne fresche', quantity: 500, unit: 'g', category: 'pasta' },
      { ingredient: 'ragù di carne', quantity: 500, unit: 'g', category: 'carne' },
      { ingredient: 'besciamella', quantity: 500, unit: 'ml', category: 'latticini' },
      { ingredient: 'parmigiano', quantity: 150, unit: 'g', category: 'latticini' },
      { ingredient: 'mozzarella', quantity: 200, unit: 'g', category: 'latticini' },
    ],
    'amatriciana': [
      { ingredient: 'spaghetti', quantity: 400, unit: 'g', category: 'pasta' },
      { ingredient: 'guanciale', quantity: 150, unit: 'g', category: 'carne' },
      { ingredient: 'pomodori pelati', quantity: 400, unit: 'g', category: 'verdure' },
      { ingredient: 'pecorino romano', quantity: 80, unit: 'g', category: 'latticini' },
      { ingredient: 'peperoncino', quantity: 1, unit: 'pz', category: 'spezie' },
    ],
    'pesto': [
      { ingredient: 'trofie', quantity: 400, unit: 'g', category: 'pasta' },
      { ingredient: 'basilico fresco', quantity: 80, unit: 'g', category: 'verdure' },
      { ingredient: 'pinoli', quantity: 30, unit: 'g', category: 'altro' },
      { ingredient: 'parmigiano', quantity: 60, unit: 'g', category: 'latticini' },
      { ingredient: 'aglio', quantity: 1, unit: 'spicchio', category: 'verdure' },
      { ingredient: 'olio extravergine', quantity: 80, unit: 'ml', category: 'altro' },
    ],
  };

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (apiKey && !apiKey.includes('your-openai')) {
      this.openai = new OpenAI({ apiKey });
    } else {
      console.log('⚠️  OpenAI API key non configurata. Uso mock AI per sviluppo.');
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
    const lower = text.toLowerCase();

    const knownRecipes = ['carbonara', 'tiramisu', 'tiramisù', 'lasagna', 'amatriciana', 'pesto'];
    for (const name of knownRecipes) {
      if (lower.includes(name)) {
        const peopleMatch = lower.match(new RegExp(`${name}[^0-9]*?(\\d+)\\s*person`));
        const people = peopleMatch ? parseInt(peopleMatch[1]) : 4;
        recipes.push({ name: name.charAt(0).toUpperCase() + name.slice(1), people });
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
      const key = recipe.name.toLowerCase().replace('ù', 'u');
      const baseIngredients = this.mockRecipes[key] || this.mockRecipes['carbonara'];
      const scale = recipe.people / 4;

      for (const ing of baseIngredients) {
        const id = ing.ingredient;
        if (merged[id]) {
          merged[id].quantity += Math.round(ing.quantity * scale);
        } else {
          merged[id] = { ...ing, quantity: Math.round(ing.quantity * scale) };
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
