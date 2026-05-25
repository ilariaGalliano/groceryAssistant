import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'recipes', pathMatch: 'full' },
  {
    path: 'recipes',
    loadComponent: () =>
      import('./components/recipe-input/recipe-input.component').then(
        (m) => m.RecipeInputComponent
      ),
  },
  {
    path: 'weekly',
    loadComponent: () =>
      import('./components/weekly-planner/weekly-planner.component').then(
        (m) => m.WeeklyPlannerComponent
      ),
  },
  {
    path: 'shopping-list',
    loadComponent: () =>
      import('./components/shopping-list/shopping-list.component').then(
        (m) => m.ShoppingListComponent
      ),
  },
];
