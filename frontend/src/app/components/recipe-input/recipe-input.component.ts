import { Component, signal, computed, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GroceryService, RecipeResult, SimilarRecipe } from '../../services/grocery.service';
import { VoiceService } from '../../services/voice.service';

@Component({
  selector: 'app-recipe-input',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './recipe-input.component.html',
  styleUrl: './recipe-input.component.css'
})
export class RecipeInputComponent {
  userInput = signal('');
  recipeResults = signal<RecipeResult[]>([]);
  loading = signal(false);
  error = signal('');
  activeTab = signal<'original' | 'vegetarian' | 'similar'>('original');

  // Voice
  voiceSupported = this.voiceService.isSupported;
  isListening = this.voiceService.isListening;

  // People counter
  people = signal(4);

  // Quick recipes
  quickRecipes = [
    { name: 'Carbonara', emoji: '🍝' },
    { name: 'Lasagna', emoji: '🧀' },
    { name: 'Tiramisù', emoji: '🍰' },
    { name: 'Amatriciana', emoji: '🍅' },
    { name: 'Pesto', emoji: '🌿' },
    { name: 'Risotto', emoji: '🍚' },
  ];

  // Meal type
  mealTypes = [
    { id: 'pranzo', label: 'Pranzo', emoji: '☀️' },
    { id: 'cena', label: 'Cena', emoji: '🌙' },
    { id: 'brunch', label: 'Brunch', emoji: '🥐' },
  ];
  selectedMealType = signal('cena');

  // Diet preferences
  dietOptions = [
    { id: 'vegetariano', label: 'Vegetariano', emoji: '🥬' },
    { id: 'vegano', label: 'Vegano', emoji: '🌱' },
    { id: 'senza-glutine', label: 'Senza Glutine', emoji: '🚫🌾' },
  ];
  selectedDiets = signal<string[]>([]);

  // Budget
  budgetLevels = ['economico', 'medio', 'premium'];
  budgetLabels: Record<string, string> = {
    economico: '💰 Economico',
    medio: '💳 Medio',
    premium: '✨ Premium',
  };
  selectedBudget = signal('medio');

  // Computed: full prompt combining all options
  fullPrompt = computed(() => {
    const parts: string[] = [];
    const input = this.userInput();
    if (input.trim()) {
      parts.push(input);
    }
    parts.push(`per ${this.people()} persone`);
    parts.push(`(${this.selectedMealType()})`);

    const diets = this.selectedDiets();
    if (diets.length > 0) {
      parts.push(`- preferenze: ${diets.join(', ')}`);
    }

    parts.push(`- budget: ${this.selectedBudget()}`);
    return parts.join(' ');
  });

  constructor(
    private groceryService: GroceryService,
    private voiceService: VoiceService,
  ) {
    // When voice transcript changes, append to input
    effect(() => {
      const transcript = this.voiceService.transcript();
      if (transcript) {
        const current = this.userInput();
        if (current.trim()) {
          this.userInput.set(`${current}, ${transcript}`);
        } else {
          this.userInput.set(transcript);
        }
      }
    });
  }

  toggleVoice() {
    this.voiceService.toggle();
  }

  addPerson() {
    if (this.people() < 20) this.people.set(this.people() + 1);
  }

  removePerson() {
    if (this.people() > 1) this.people.set(this.people() - 1);
  }

  selectQuickRecipe(name: string) {
    const current = this.userInput();
    if (current.trim()) {
      this.userInput.set(`${current}, ${name.toLowerCase()}`);
    } else {
      this.userInput.set(name.toLowerCase());
    }
  }

  toggleDiet(dietId: string) {
    const current = this.selectedDiets();
    if (current.includes(dietId)) {
      this.selectedDiets.set(current.filter((d) => d !== dietId));
    } else {
      this.selectedDiets.set([...current, dietId]);
    }
  }

  isDietSelected(dietId: string): boolean {
    return this.selectedDiets().includes(dietId);
  }

  onSubmit() {
    const prompt = this.fullPrompt();
    if (!prompt.trim()) return;

    this.loading.set(true);
    this.error.set('');

    this.groceryService.processRecipes(prompt).subscribe({
      next: (response) => {
        this.recipeResults.set(response.recipes);
        this.loading.set(false);
        
        // Se l'utente cerca ricetta vegetariana/vegana o ha selezionato dieta, mostra tab vegetariano
        const diets = this.selectedDiets();
        const input = this.userInput().toLowerCase();
        const isVegetarianSearch = 
          diets.includes('vegetariano') || 
          diets.includes('vegano') ||
          input.includes('vegetarian') ||
          input.includes('vegano') ||
          input.includes('vegana') ||
          input.includes('vegan');
        
        if (isVegetarianSearch) {
          this.activeTab.set('vegetarian');
        } else {
          this.activeTab.set('original');
        }
      },
      error: (err) => {
        if (err?.status === 0) {
          this.error.set('Errore di connessione/CORS con il backend locale. Controlla che backend sia avviato e CORS configurato.');
        } else {
          this.error.set(err?.error?.message || 'Errore nel processamento delle ricette. Riprova.');
        }
        this.loading.set(false);
      },
    });
  }

  setTab(tab: 'original' | 'vegetarian' | 'similar') {
    this.activeTab.set(tab);
  }

  removeRecipe(index: number) {
    const current = this.recipeResults();
    this.recipeResults.set(current.filter((_, i) => i !== index));
  }

  // Genera lista per UNA SOLA ricetta
  addSingleRecipeToList(recipe: { name: string; people: number }) {
    this.loading.set(true);
    this.groceryService.generateShoppingList([recipe], true).subscribe({
      next: () => {
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Errore nell\'aggiunta alla lista.');
        this.loading.set(false);
      },
    });
  }

  // Seleziona una ricetta simile e la promuove a ricetta principale
  selectSimilarRecipe(similar: SimilarRecipe, resultIndex: number) {
    const current = this.recipeResults();
    const updated = [...current];
    
    // Crea un nuovo RecipeResult con la ricetta simile come originale
    updated[resultIndex] = {
      original: {
        name: similar.name,
        people: similar.people,
        ingredients: similar.ingredients,
      },
      similarRecipes: current[resultIndex].similarRecipes.filter(r => r.name !== similar.name),
      vegetarianVersion: similar.isVegetarian 
        ? { name: similar.name, description: similar.description, ingredients: similar.ingredients }
        : current[resultIndex].vegetarianVersion,
    };
    
    this.recipeResults.set(updated);
    this.activeTab.set('original');
  }

  // Traccia ricette simili per _id o name
  trackSimilarRecipe(_index: number, similar: SimilarRecipe): string {
    return similar._id || similar.name;
  }
}
