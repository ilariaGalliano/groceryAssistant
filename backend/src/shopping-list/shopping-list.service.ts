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

  async generate(recipes: { name: string; people: number }[]) {
    const items = await this.aiService.getIngredients(recipes);

    const shoppingList = new this.shoppingListModel({ items });
    await shoppingList.save();

    return { items, createdAt: shoppingList.createdAt };
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
