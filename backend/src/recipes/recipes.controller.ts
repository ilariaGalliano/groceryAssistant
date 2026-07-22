import { Controller, Post, Get, Body, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { AiService } from '../ai/ai.service';
import { RecipesService } from './recipes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TextInputDto } from '../common/dto/input.dto';

type AuthRequest = Request & { user: { userId: string } };

@Controller('api/recipes')
@UseGuards(JwtAuthGuard)
export class RecipesController {
  constructor(
    private aiService: AiService,
    private recipesService: RecipesService,
  ) {}

  @Post('parse')
  async parseRecipes(@Body() dto: TextInputDto) {
    return this.aiService.parseRecipes(dto.text, dto.preferences);
  }

  @Post('process')
  async processRequest(@Req() req: AuthRequest, @Body() dto: TextInputDto) {
    return this.recipesService.processRequest(dto.text, req.user.userId, dto.preferences);
  }

  @Post('search')
  async searchSimilar(@Req() req: AuthRequest, @Body() dto: TextInputDto) {
    return this.recipesService.searchSimilar(dto.text, req.user.userId);
  }

  @Get()
  async getAllRecipes(@Req() req: AuthRequest) {
    return this.recipesService.getAllRecipes(req.user.userId);
  }
}
