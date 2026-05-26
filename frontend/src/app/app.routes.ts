import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'recipes', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./components/login/login.component').then(
        (m) => m.LoginComponent
      ),
  },
  {
    path: 'recipes',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/recipe-input/recipe-input.component').then(
        (m) => m.RecipeInputComponent
      ),
  },
  {
    path: 'weekly',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/weekly-planner/weekly-planner.component').then(
        (m) => m.WeeklyPlannerComponent
      ),
  },
  {
    path: 'shopping-list',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/shopping-list/shopping-list.component').then(
        (m) => m.ShoppingListComponent
      ),
  },
];
