import { Component, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GroceryService, Ingredient } from '../../services/grocery.service';

interface MealSlot {
  recipe: string;
}

interface DayPlan {
  day: string;
  shortDay: string;
  pranzo: MealSlot;
  cena: MealSlot;
}

@Component({
  selector: 'app-weekly-planner',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './weekly-planner.component.html',
  styleUrl: './weekly-planner.component.css',
})
export class WeeklyPlannerComponent {
  loading = signal(false);
  error = signal('');
  weeklyListGenerated = signal(false);

  // All available days
  allDays: DayPlan[] = [
    { day: 'Lunedì', shortDay: 'Lun', pranzo: { recipe: '' }, cena: { recipe: '' } },
    { day: 'Martedì', shortDay: 'Mar', pranzo: { recipe: '' }, cena: { recipe: '' } },
    { day: 'Mercoledì', shortDay: 'Mer', pranzo: { recipe: '' }, cena: { recipe: '' } },
    { day: 'Giovedì', shortDay: 'Gio', pranzo: { recipe: '' }, cena: { recipe: '' } },
    { day: 'Venerdì', shortDay: 'Ven', pranzo: { recipe: '' }, cena: { recipe: '' } },
    { day: 'Sabato', shortDay: 'Sab', pranzo: { recipe: '' }, cena: { recipe: '' } },
    { day: 'Domenica', shortDay: 'Dom', pranzo: { recipe: '' }, cena: { recipe: '' } },
  ];

  // Only selected days appear in the plan
  weekPlan = signal<DayPlan[]>([]);

  // Days available to add (not yet in the plan)
  availableDays = computed(() => {
    const usedDays = this.weekPlan().map((d) => d.day);
    return this.allDays.filter((d) => !usedDays.includes(d.day));
  });

  people = signal(4);

  quickSuggestions = [
    'Carbonara', 'Lasagna', 'Pesto', 'Amatriciana',
    'Risotto', 'Insalata', 'Minestrone', 'Pizza',
    'Pollo arrosto', 'Pesce al forno', 'Frittata', 'Tiramisù',
  ];

  filledMeals = computed(() => {
    return this.weekPlan().reduce((count, day) => {
      if (day.pranzo.recipe.trim()) count++;
      if (day.cena.recipe.trim()) count++;
      return count;
    }, 0);
  });

  totalMeals = computed(() => this.weekPlan().length * 2);

  constructor(private groceryService: GroceryService) {}

  addDay(day: string) {
    const dayTemplate = this.allDays.find((d) => d.day === day);
    if (!dayTemplate) return;
    // Insert in correct order
    const newPlan = [...this.weekPlan(), { ...dayTemplate, pranzo: { recipe: '' }, cena: { recipe: '' } }];
    const order = this.allDays.map((d) => d.day);
    newPlan.sort((a, b) => order.indexOf(a.day) - order.indexOf(b.day));
    this.weekPlan.set(newPlan);
  }

  removeDay(dayIndex: number) {
    const plan = [...this.weekPlan()];
    plan.splice(dayIndex, 1);
    this.weekPlan.set(plan);
  }

  addAllDays() {
    this.weekPlan.set(this.allDays.map((d) => ({ ...d, pranzo: { recipe: '' }, cena: { recipe: '' } })));
  }

  addPerson() {
    if (this.people() < 20) this.people.set(this.people() + 1);
  }

  removePerson() {
    if (this.people() > 1) this.people.set(this.people() - 1);
  }

  setMeal(dayIndex: number, meal: 'pranzo' | 'cena', recipe: string) {
    const plan = [...this.weekPlan()];
    plan[dayIndex] = {
      ...plan[dayIndex],
      [meal]: { recipe },
    };
    this.weekPlan.set(plan);
  }

  fillWithSuggestion(dayIndex: number, meal: 'pranzo' | 'cena') {
    const used = this.weekPlan().flatMap((d) => [d.pranzo.recipe, d.cena.recipe].filter(Boolean));
    const available = this.quickSuggestions.filter((s) => !used.includes(s));
    const pick = available.length > 0
      ? available[Math.floor(Math.random() * available.length)]
      : this.quickSuggestions[Math.floor(Math.random() * this.quickSuggestions.length)];
    this.setMeal(dayIndex, meal, pick);
  }

  clearAll() {
    this.weekPlan.set([]);
    this.weeklyListGenerated.set(false);
  }

  autoFillWeek() {
    const shuffled = [...this.quickSuggestions].sort(() => Math.random() - 0.5);
    let idx = 0;
    this.weekPlan.set(
      this.allDays.map((day) => ({
        ...day,
        pranzo: { recipe: shuffled[idx++ % shuffled.length] },
        cena: { recipe: shuffled[idx++ % shuffled.length] },
      }))
    );
  }

  generateWeeklyList() {
    const allRecipes = this.weekPlan()
      .flatMap((day) => [day.pranzo.recipe, day.cena.recipe])
      .filter((r) => r.trim().length > 0);

    if (allRecipes.length === 0) {
      this.error.set('Aggiungi almeno una ricetta al piano settimanale.');
      return;
    }

    const prompt = `${allRecipes.join(', ')} per ${this.people()} persone`;

    this.loading.set(true);
    this.error.set('');

    this.groceryService.processRecipes(prompt).subscribe({
      next: (response) => {
        // Also generate the shopping list
        const recipes = response.recipes.map((r) => ({
          name: r.original.name,
          people: r.original.people,
        }));
        this.groceryService.generateShoppingList(recipes).subscribe({
          next: () => {
            this.loading.set(false);
            this.weeklyListGenerated.set(true);
          },
          error: () => {
            this.loading.set(false);
            this.error.set('Errore nella generazione della lista settimanale.');
          },
        });
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Errore nel processamento del piano settimanale.');
      },
    });
  }
}
