import { Component, computed, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GroceryService, Ingredient } from '../../services/grocery.service';

@Component({
  selector: 'app-shopping-list',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './shopping-list.component.html',
  styleUrl: './shopping-list.component.css'
})
export class ShoppingListComponent implements OnInit {
  constructor(private groceryService: GroceryService) {}

  items = this.groceryService.shoppingList;
  showAddForm = signal(false);
  newItem = signal({ ingredient: '', quantity: 1, unit: 'pz', category: 'altro' });

  categoryIcons: Record<string, string> = {
    carne: '🥩',
    latticini: '🥛',
    verdure: '🥬',
    pasta: '🍝',
    spezie: '🧂',
    frutta: '🍎',
    pesce: '🐟',
    altro: '🛒',
  };

  categoryOptions = ['carne', 'latticini', 'verdure', 'pasta', 'spezie', 'frutta', 'pesce', 'altro'];
  unitOptions = ['g', 'kg', 'ml', 'l', 'pz', 'cucchiai', 'cucchiaini'];

  groupedItems = computed(() => {
    const groups: Record<string, Ingredient[]> = {};
    for (const item of this.items()) {
      const cat = item.category || 'altro';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    }
    return groups;
  });

  categories = computed(() => Object.keys(this.groupedItems()));

  ngOnInit() {
    this.groceryService.getShoppingList().subscribe();
  }

  getIcon(category: string): string {
    return this.categoryIcons[category] || '🛒';
  }

  removeItem(ingredient: string) {
    this.groceryService.removeFromList(ingredient);
  }

  toggleAddForm() {
    this.showAddForm.set(!this.showAddForm());
  }

  addItem() {
    const item = this.newItem();
    if (!item.ingredient.trim()) return;
    this.groceryService.addToList({ ...item });
    this.newItem.set({ ingredient: '', quantity: 1, unit: 'pz', category: 'altro' });
    this.showAddForm.set(false);
  }

  updateNewItem(field: string, value: any) {
    this.newItem.set({ ...this.newItem(), [field]: value });
  }
}
