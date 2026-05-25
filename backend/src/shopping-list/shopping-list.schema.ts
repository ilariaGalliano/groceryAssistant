import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class ShoppingList extends Document {
  declare createdAt: Date;
  declare updatedAt: Date;

  @Prop({
    type: [
      {
        ingredient: String,
        quantity: Number,
        unit: String,
        category: String,
      },
    ],
  })
  items: { ingredient: string; quantity: number; unit: string; category: string }[];
}

export const ShoppingListSchema = SchemaFactory.createForClass(ShoppingList);
