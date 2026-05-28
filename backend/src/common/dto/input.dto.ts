import { IsString, IsNumber, IsArray, ValidateNested, Min, Max, MaxLength, IsBoolean, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

class RecipeItemDto {
  @IsString()
  @MaxLength(200)
  name!: string;

  @IsNumber()
  @Min(1)
  @Max(50)
  people!: number;
}

export class GenerateListDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecipeItemDto)
  recipes!: RecipeItemDto[];

  @IsOptional()
  @IsBoolean()
  append?: boolean;
}

export class ToggleDoneDto {
  @IsString()
  @MaxLength(200)
  ingredient!: string;
}

export class TextInputDto {
  @IsString()
  @MaxLength(5000, { message: 'Il testo non può superare 5000 caratteri' })
  text!: string;
}
