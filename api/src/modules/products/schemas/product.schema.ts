import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProductDocument = Product & Document;

class Variant {
  @Prop()
  type: string;

  @Prop()
  name: string;

  @Prop([String])
  options: string[];
}

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop([String])
  images?: string[];

  @Prop()
  category?: string;

  @Prop({ default: 0 })
  stock: number;

  @Prop([Object])
  variants?: Variant[];

  @Prop({ min: 0, max: 5 })
  rating?: number;

  @Prop({ default: 0 })
  reviews?: number;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
ProductSchema.set('toJSON', {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});
