import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface ParsedRecipe {
  name: string;
  people: number;
}

export interface Ingredient {
  ingredient: string;
  quantity: number;
  unit: string;
  category: string;
}

export interface ShoppingList {
  items: Ingredient[];
  createdAt: string;
}

export interface VegetarianVersion {
  name: string;
  description: string;
  ingredients: Ingredient[];
}

export interface RecipeResult {
  original: {
    name: string;
    people: number;
    ingredients: Ingredient[];
  };
  similarRecipes: {
    name: string;
    ingredients: Ingredient[];
    description: string;
    isVegetarian: boolean;
    score?: number;
  }[];
  vegetarianVersion: VegetarianVersion;
}

export interface ProcessResponse {
  recipes: RecipeResult[];
}

@Injectable({
  providedIn: 'root',
})
export class GroceryService {
  private apiUrl = 'http://localhost:3000/api';

  shoppingList = signal<Ingredient[]>([]);
  processedRecipes = signal<RecipeResult[]>([]);
  loading = signal(false);

  constructor(private http: HttpClient) {}

  parseRecipes(input: string): Observable<ParsedRecipe[]> {
    return this.http.post<ParsedRecipe[]>(`${this.apiUrl}/recipes/parse`, {
      text: input,
    });
  }

  /**
   * Flusso completo:
   * 1. OpenAI interpreta richiesta
   * 2. MongoDB Vector Search cerca ricette simili
   * 3. AI genera versione vegetariana
   */
  processRecipes(input: string): Observable<ProcessResponse> {
    return this.http
      .post<ProcessResponse>(`${this.apiUrl}/recipes/process`, { text: input })
      .pipe(tap((response) => this.processedRecipes.set(response.recipes)));
  }

  searchSimilar(text: string): Observable<any[]> {
    return this.http.post<any[]>(`${this.apiUrl}/recipes/search`, { text });
  }

  generateShoppingList(recipes: ParsedRecipe[]): Observable<ShoppingList> {
    return this.http
      .post<ShoppingList>(`${this.apiUrl}/shopping-list/generate`, { recipes })
      .pipe(tap((list) => this.shoppingList.set(list.items)));
  }

  getShoppingList(): Observable<ShoppingList> {
    return this.http
      .get<ShoppingList>(`${this.apiUrl}/shopping-list`)
      .pipe(tap((list) => this.shoppingList.set(list.items)));
  }

  removeFromList(ingredient: string) {
    this.shoppingList.set(this.shoppingList().filter((i) => i.ingredient !== ingredient));
  }

  addToList(item: Ingredient) {
    const existing = this.shoppingList().find((i) => i.ingredient === item.ingredient);
    if (existing) {
      this.shoppingList.set(
        this.shoppingList().map((i) =>
          i.ingredient === item.ingredient ? { ...i, quantity: i.quantity + item.quantity } : i
        )
      );
    } else {
      this.shoppingList.set([...this.shoppingList(), item]);
    }
  }
}
