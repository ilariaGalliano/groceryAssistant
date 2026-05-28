import { Controller, Post, Get, Patch, Delete, Body, UseGuards } from '@nestjs/common';
import { ShoppingListService } from './shopping-list.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GenerateListDto, ToggleDoneDto } from '../common/dto/input.dto';

@Controller('api/shopping-list')
@UseGuards(JwtAuthGuard)
export class ShoppingListController {
  constructor(private shoppingListService: ShoppingListService) {}

  @Post('generate')
  async generate(@Body() dto: GenerateListDto) {
    return this.shoppingListService.generate(dto.recipes, dto.append ?? true);
  }

  @Get()
  async getLatest() {
    return this.shoppingListService.getLatest();
  }

  @Patch('toggle-done')
  async toggleDone(@Body() dto: ToggleDoneDto) {
    return this.shoppingListService.toggleDone(dto.ingredient);
  }

  @Patch('remove-item')
  async removeItem(@Body() dto: ToggleDoneDto) {
    return this.shoppingListService.removeItem(dto.ingredient);
  }

  @Delete()
  async clearAll() {
    return this.shoppingListService.clearAll();
  }
}
