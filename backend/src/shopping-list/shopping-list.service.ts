import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ShoppingList } from './shopping-list.schema';
import { AiService } from '../ai/ai.service';

@Injectable()
export class ShoppingListService {
  constructor(
    @InjectModel(ShoppingList.name)
    private shoppingListModel: Model<ShoppingList>,
    private aiService: AiService,
  ) {}

  async generate(recipes: { name: string; people: number }[], append: boolean = true) {
    const newItems = await this.aiService.getIngredients(recipes);

    if (append) {
      // Recupera lista esistente e merge ingredienti
      const existingList = await this.shoppingListModel
        .findOne()
        .sort({ createdAt: -1 })
        .exec();

      if (existingList) {
        // Merge: somma quantità se stesso ingrediente, altrimenti aggiungi
        const mergedItems = [...existingList.items];
        
        for (const newItem of newItems) {
          const existing = mergedItems.find(
            (i) => i.ingredient.toLowerCase() === newItem.ingredient.toLowerCase()
          );
          
          if (existing) {
            // Somma quantità
            existing.quantity += newItem.quantity;
          } else {
            // Aggiungi nuovo ingrediente
            mergedItems.push({ ...newItem, isDone: false });
          }
        }

        existingList.items = mergedItems;
        existingList.updatedAt = new Date();
        await existingList.save();
        
        return { items: mergedItems, createdAt: existingList.createdAt };
      }
    }

    // Crea nuova lista se non esiste o append=false
    const shoppingList = new this.shoppingListModel({ 
      items: newItems.map(i => ({ ...i, isDone: false })) 
    });
    await shoppingList.save();

    return { items: shoppingList.items, createdAt: shoppingList.createdAt };
  }

  async getLatest() {
    const list = await this.shoppingListModel
      .findOne()
      .sort({ createdAt: -1 })
      .exec();

    if (!list) {
      return { items: [], createdAt: null };
    }
    return { items: list.items, createdAt: list.createdAt };
  }

  async toggleDone(ingredient: string) {
    const list = await this.shoppingListModel
      .findOne()
      .sort({ createdAt: -1 })
      .exec();

    if (!list) return null;

    const item = list.items.find((i) => i.ingredient === ingredient);
    if (item) {
      item.isDone = !item.isDone;
      await list.save();
    }
    return { items: list.items, createdAt: list.createdAt };
  }
}
