import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ParsedRecipe {
  name: string;
  people: number;
}

export interface Ingredient {
  ingredient: string;
  quantity: number;
  unit: string;
  category: string;
  isDone?: boolean;
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

export interface SimilarRecipe {
  _id?: string;
  name: string;
  people: number;
  ingredients: Ingredient[];
  description: string;
  isVegetarian: boolean;
  score?: number;
}

export interface RecipeResult {
  original: {
    name: string;
    people: number;
    ingredients: Ingredient[];
  };
  similarRecipes: SimilarRecipe[];
  vegetarianVersion: VegetarianVersion;
}

export interface ProcessResponse {
  recipes: RecipeResult[];
}

export interface RecipePreferences {
  diets: string[];
  budget: string;
  mealType: string;
}

@Injectable({
  providedIn: 'root',
})
export class GroceryService {
  private apiUrl = environment.apiUrl;

  shoppingList = signal<Ingredient[]>([]);
  processedRecipes = signal<RecipeResult[]>([]);
  loading = signal(false);

  constructor(private http: HttpClient) {}

  parseRecipes(input: string, preferences?: RecipePreferences): Observable<ParsedRecipe[]> {
    return this.http.post<ParsedRecipe[]>(`${this.apiUrl}/recipes/parse`, {
      text: input,
      preferences,
    });
  }

  processRecipes(input: string, preferences?: RecipePreferences): Observable<ProcessResponse> {
    return this.http
      .post<ProcessResponse>(`${this.apiUrl}/recipes/process`, { text: input, preferences })
      .pipe(tap((response) => this.processedRecipes.set(response.recipes)));
  }

  searchSimilar(text: string): Observable<any[]> {
    return this.http.post<any[]>(`${this.apiUrl}/recipes/search`, { text });
  }

  generateShoppingList(recipes: ParsedRecipe[], append: boolean = true): Observable<ShoppingList> {
    return this.http
      .post<ShoppingList>(`${this.apiUrl}/shopping-list/generate`, { recipes, append })
      .pipe(tap((list) => this.shoppingList.set(list.items)));
  }

  getShoppingList(): Observable<ShoppingList> {
    return this.http
      .get<ShoppingList>(`${this.apiUrl}/shopping-list`)
      .pipe(tap((list) => this.shoppingList.set(list.items)));
  }

  toggleDone(ingredient: string) {
    const snapshot = this.shoppingList();
    this.shoppingList.set(
      snapshot.map((i) => i.ingredient === ingredient ? { ...i, isDone: !i.isDone } : i)
    );
    this.http
      .patch<ShoppingList>(`${this.apiUrl}/shopping-list/toggle-done`, { ingredient })
      .pipe(catchError((err) => { this.shoppingList.set(snapshot); return throwError(() => err); }))
      .subscribe();
  }

  removeFromList(ingredient: string) {
    const snapshot = this.shoppingList();
    this.shoppingList.set(snapshot.filter((i) => i.ingredient !== ingredient));
    this.http
      .patch(`${this.apiUrl}/shopping-list/remove-item`, { ingredient })
      .pipe(catchError((err) => { this.shoppingList.set(snapshot); return throwError(() => err); }))
      .subscribe();
  }

  addToList(item: Ingredient) {
    const snapshot = this.shoppingList();
    // Ottimistic update
    const existing = snapshot.find((i) => i.ingredient.toLowerCase() === item.ingredient.toLowerCase());
    if (existing) {
      this.shoppingList.set(
        snapshot.map((i) =>
          i.ingredient.toLowerCase() === item.ingredient.toLowerCase()
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        )
      );
    } else {
      this.shoppingList.set([...snapshot, { ...item, isDone: false }]);
    }

    // Persist sul backend con rollback in caso di errore
    this.http
      .patch<ShoppingList>(`${this.apiUrl}/shopping-list/add-item`, {
        ingredient: item.ingredient,
        quantity: item.quantity,
        unit: item.unit,
        category: item.category,
      })
      .pipe(
        tap((list) => this.shoppingList.set(list.items)),
        catchError((err) => { this.shoppingList.set(snapshot); return throwError(() => err); }),
      )
      .subscribe();
  }

  clearAll(): Observable<{ items: never[], createdAt: null }> {
    this.shoppingList.set([]);
    return this.http.delete<{ items: never[], createdAt: null }>(`${this.apiUrl}/shopping-list`);
  }
}
