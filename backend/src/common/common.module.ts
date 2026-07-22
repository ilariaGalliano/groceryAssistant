import { Module } from '@nestjs/common';
import { IngredientNormalizationService } from './ingredient-normalization.service';

@Module({
  providers: [IngredientNormalizationService],
  exports: [IngredientNormalizationService],
})
export class CommonModule {}
