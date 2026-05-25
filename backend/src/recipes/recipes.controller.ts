import { Controller, Post, Get, Body } from '@nestjs/common';
import { AiService } from '../ai/ai.service';
import { RecipesService } from './recipes.service';

@Controller('api/recipes')
export class RecipesController {
  constructor(
    private aiService: AiService,
    private recipesService: RecipesService,
  ) {}

  @Post('parse')
  async parseRecipes(@Body('text') text: string) {
    return this.aiService.parseRecipes(text);
  }

  /**
   * Flusso completo:
   * 1. OpenAI interpreta richiesta
   * 2. MongoDB Vector Search cerca ricette simili
   * 3. AI genera versione vegetariana
   * 4. Ritorna dati per UI dinamica
   */
  @Post('process')
  async processRequest(@Body('text') text: string) {
    return this.recipesService.processRequest(text);
  }

  /**
   * Cerca ricette semanticamente simili via Vector Search
   */
  @Post('search')
  async searchSimilar(@Body('text') text: string) {
    return this.recipesService.searchSimilar(text);
  }

  @Get()
  async getAllRecipes() {
    return this.recipesService.getAllRecipes();
  }
}
