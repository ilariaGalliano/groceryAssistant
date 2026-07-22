import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ShoppingList } from './shopping-list.schema';
import { AiService } from '../ai/ai.service';
import { IngredientNormalizationService, ListItem, NormalizedIngredient } from '../common/ingredient-normalization.service';

@Injectable()
export class ShoppingListService {
  constructor(
    @InjectModel(ShoppingList.name)
    private shoppingListModel: Model<ShoppingList>,
    private aiService: AiService,
    private normalization: IngredientNormalizationService,
  ) {}

  async generate(userId: string, recipes: { name: string; people: number }[], append: boolean = true) {
    const newItems = await this.aiService.getIngredients(recipes);

    if (append) {
      // Recupera lista esistente e merge ingredienti
      const existingList = await this.shoppingListModel
        .findOne({ userId })
        .sort({ createdAt: -1 })
        .exec();

      if (existingList) {
        const mergedItems = this.normalization.mergeItems(existingList.items as ListItem[], newItems as NormalizedIngredient[]);

        existingList.items = mergedItems;
        existingList.updatedAt = new Date();
        await existingList.save();
        
        return { items: mergedItems, createdAt: existingList.createdAt };
      }
    }

    // Crea nuova lista se non esiste o append=false
    const shoppingList = new this.shoppingListModel({ 
      userId,
      items: newItems.map(i => ({ ...i, isDone: false })) 
    });
    await shoppingList.save();

    return { items: shoppingList.items, createdAt: shoppingList.createdAt };
  }

  async getLatest(userId: string) {
    const list = await this.shoppingListModel
      .findOne({ userId })
      .sort({ createdAt: -1 })
      .exec();

    if (!list) {
      return { items: [], createdAt: null };
    }
    return { items: list.items, createdAt: list.createdAt };
  }

  async toggleDone(userId: string, ingredient: string) {
    const list = await this.shoppingListModel
      .findOne({ userId })
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

  async removeItem(userId: string, ingredient: string) {
    const list = await this.shoppingListModel
      .findOne({ userId })
      .sort({ createdAt: -1 })
      .exec();

    if (!list) return null;

    list.items = list.items.filter((i) => i.ingredient !== ingredient);
    await list.save();
    
    return { items: list.items, createdAt: list.createdAt };
  }

  async clearAll(userId: string) {
    await this.shoppingListModel.deleteMany({ userId });
    return { items: [], createdAt: null };
  }

  async addItem(userId: string, item: { ingredient: string; quantity: number; unit: string; category: string }) {
    const list = await this.shoppingListModel.findOne({ userId }).sort({ createdAt: -1 }).exec();

    if (list) {
      list.items = this.normalization.mergeItems(list.items as ListItem[], [item] as NormalizedIngredient[]);
      list.updatedAt = new Date();
      await list.save();
      return { items: list.items, createdAt: list.createdAt };
    }

    const newList = new this.shoppingListModel({ userId, items: [{ ...item, isDone: false }] });
    await newList.save();
    return { items: newList.items, createdAt: newList.createdAt };
  }
}
