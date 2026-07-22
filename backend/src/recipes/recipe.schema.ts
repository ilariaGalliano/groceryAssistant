import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Recipe extends Document {
  @Prop({ required: true, index: true })
  userId!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ default: 2 })
  people!: number;

  @Prop({ type: [Object] })
  ingredients!: { ingredient: string; quantity: number; unit: string; category: string }[];

  @Prop({ type: [Number], index: false })
  embedding!: number[];

  @Prop()
  description!: string;

  @Prop({ default: false })
  isVegetarian!: boolean;

  @Prop()
  originalRecipeId!: string;
}

export const RecipeSchema = SchemaFactory.createForClass(Recipe);
