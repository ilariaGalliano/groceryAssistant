import { Controller, Post, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ShoppingListService } from './shopping-list.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/shopping-list')
@UseGuards(JwtAuthGuard)
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
