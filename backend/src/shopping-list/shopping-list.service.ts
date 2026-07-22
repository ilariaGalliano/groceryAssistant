import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ShoppingList } from './shopping-list.schema';
import { AiService } from '../ai/ai.service';

type Item = { ingredient: string; quantity: number; unit: string; category: string; isDone: boolean };

/** Converte quantità + unità verso un'unità canonica per consentire il merge. */
function normalizeUnit(quantity: number, unit: string): { quantity: number; unit: string } {
  switch (unit.toLowerCase().trim()) {
    // Massa → g
    case 'kg':  return { quantity: quantity * 1000, unit: 'g' };
    case 'mg':  return { quantity: quantity / 1000, unit: 'g' };
    // Volume → ml
    case 'l': case 'lt': case 'litro': case 'litri':
      return { quantity: quantity * 1000, unit: 'ml' };
    case 'dl': return { quantity: quantity * 100,  unit: 'ml' };
    case 'cl': return { quantity: quantity * 10,   unit: 'ml' };
    case 'cucchiaio': case 'cucchiai': case 'tbsp':
      return { quantity: quantity * 15, unit: 'ml' };
    case 'cucchiaino': case 'cucchiaini': case 'tsp':
      return { quantity: quantity * 5,  unit: 'ml' };
    case 'tazza': case 'tazze': case 'cup': case 'cups':
      return { quantity: quantity * 240, unit: 'ml' };
    // Pezzi alias → pz
    case 'pezzo': case 'pezzi': case 'piece': case 'pieces':
    case 'spicchio': case 'spicchi':
    case 'foglia': case 'foglie':
    case 'rametto': case 'rametti':
    case 'fetta': case 'fette':
    case 'mazzo': case 'mazzi':
      return { quantity, unit: 'pz' };
    default:
      return { quantity, unit: unit.toLowerCase().trim() };
  }
}

/** Merge deterministico con normalizzazione unità. */
function mergeItems(existing: Item[], newItems: { ingredient: string; quantity: number; unit: string; category: string }[]): Item[] {
  const merged: Item[] = existing.map(i => ({ ...i }));

  for (const incoming of newItems) {
    const inNorm = normalizeUnit(incoming.quantity, incoming.unit);
    const idx = merged.findIndex(
      m =>
        m.ingredient.toLowerCase() === incoming.ingredient.toLowerCase() &&
        normalizeUnit(m.quantity, m.unit).unit === inNorm.unit,
    );

    if (idx >= 0) {
      const exNorm = normalizeUnit(merged[idx].quantity, merged[idx].unit);
      merged[idx] = { ...merged[idx], quantity: Math.round((exNorm.quantity + inNorm.quantity) * 100) / 100, unit: inNorm.unit };
    } else {
      merged.push({ ingredient: incoming.ingredient, quantity: inNorm.quantity, unit: inNorm.unit, category: incoming.category, isDone: false });
    }
  }

  return merged;
}

@Injectable()
export class ShoppingListService {
  constructor(
    @InjectModel(ShoppingList.name)
    private shoppingListModel: Model<ShoppingList>,
    private aiService: AiService,
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
        const mergedItems = mergeItems(existingList.items as Item[], newItems);

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
      list.items = mergeItems(list.items as Item[], [item]);
      list.updatedAt = new Date();
      await list.save();
      return { items: list.items, createdAt: list.createdAt };
    }

    const newList = new this.shoppingListModel({ userId, items: [{ ...item, isDone: false }] });
    await newList.save();
    return { items: newList.items, createdAt: newList.createdAt };
  }
}
