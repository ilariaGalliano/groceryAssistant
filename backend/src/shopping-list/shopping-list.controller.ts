import { Controller, Post, Get, Patch, Delete, Body, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { ShoppingListService } from './shopping-list.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GenerateListDto, ToggleDoneDto } from '../common/dto/input.dto';

type AuthRequest = Request & { user: { userId: string } };

@Controller('api/shopping-list')
@UseGuards(JwtAuthGuard)
export class ShoppingListController {
  constructor(private shoppingListService: ShoppingListService) {}

  @Post('generate')
  async generate(@Req() req: AuthRequest, @Body() dto: GenerateListDto) {
    return this.shoppingListService.generate(req.user.userId, dto.recipes, dto.append ?? true);
  }

  @Get()
  async getLatest(@Req() req: AuthRequest) {
    return this.shoppingListService.getLatest(req.user.userId);
  }

  @Patch('toggle-done')
  async toggleDone(@Req() req: AuthRequest, @Body() dto: ToggleDoneDto) {
    return this.shoppingListService.toggleDone(req.user.userId, dto.ingredient);
  }

  @Patch('remove-item')
  async removeItem(@Req() req: AuthRequest, @Body() dto: ToggleDoneDto) {
    return this.shoppingListService.removeItem(req.user.userId, dto.ingredient);
  }

  @Delete()
  async clearAll(@Req() req: AuthRequest) {
    return this.shoppingListService.clearAll(req.user.userId);
  }
}
