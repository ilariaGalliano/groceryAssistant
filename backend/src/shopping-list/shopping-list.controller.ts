import { Controller, Post, Get, Body } from '@nestjs/common';
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
}
