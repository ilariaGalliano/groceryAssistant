import { Controller, Post, Get, Patch, Body } from '@nestjs/common';
import { ShoppingListService } from './shopping-list.service';

@Controller('api/shopping-list')
export class ShoppingListController {
  constructor(private shoppingListService: ShoppingListService) {}

  @Post('generate')
  async generate(@Body('recipes') recipes: { name: string; people: number }[]) {
    return this.shoppingListService.generate(recipes);
  }

  @Get()
  async getLatest() {
    return this.shoppingListService.getLatest();
  }

  @Patch('toggle-done')
  async toggleDone(@Body('ingredient') ingredient: string) {
    return this.shoppingListService.toggleDone(ingredient);
  }
}
