import { IsString, IsNumber, IsArray, ValidateNested, Min, Max, MaxLength, IsBoolean, IsOptional, IsObject } from 'class-validator';
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

export class PreferencesDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  diets?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(50)
  budget?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  mealType?: string;
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

export class AddItemDto {
  @IsString()
  @MaxLength(200)
  ingredient!: string;

  @IsNumber()
  @Min(0)
  quantity!: number;

  @IsString()
  @MaxLength(50)
  unit!: string;

  @IsString()
  @MaxLength(100)
  category!: string;
}

export class TextInputDto {
  @IsString()
  @MaxLength(5000, { message: 'Il testo non può superare 5000 caratteri' })
  text!: string;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => PreferencesDto)
  preferences?: PreferencesDto;
}
