import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { AiService } from '../ai/ai.service';
import { RecipesService } from './recipes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TextInputDto } from '../common/dto/input.dto';

@Controller('api/recipes')
@UseGuards(JwtAuthGuard)
export class RecipesController {
  constructor(
    private aiService: AiService,
    private recipesService: RecipesService,
  ) {}

  @Post('parse')
  async parseRecipes(@Body() dto: TextInputDto) {
    return this.aiService.parseRecipes(dto.text);
  }

  /**
   * Flusso completo:
   * 1. OpenAI interpreta richiesta
   * 2. MongoDB Vector Search cerca ricette simili
   * 3. AI genera versione vegetariana
   * 4. Ritorna dati per UI dinamica
   */
  @Post('process')
  async processRequest(@Body() dto: TextInputDto) {
    return this.recipesService.processRequest(dto.text);
  }

  /**
   * Cerca ricette semanticamente simili via Vector Search
   */
  @Post('search')
  async searchSimilar(@Body() dto: TextInputDto) {
    return this.recipesService.searchSimilar(dto.text);
  }

  @Get()
  async getAllRecipes() {
    return this.recipesService.getAllRecipes();
  }
}
