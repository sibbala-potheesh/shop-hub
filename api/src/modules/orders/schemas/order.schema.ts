import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrderDocument = Order & Document;

class Contact {
  @Prop({ required: true })
  email: string;
}

class ShippingAddress {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true })
  city: string;

  @Prop()
  state?: string;

  @Prop({ required: true })
  zipcode: string;

  @Prop({ required: true })
  country: string;

  @Prop({ required: true })
  phoneNumber: string;
}

class Item {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  quantity: number;
}

export type PaymentMethod = 'CreditCard' | 'PayPal' | 'ApplePay' | 'GooglePay';
export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: Object, required: true })
  contact: Contact;

  @Prop({ type: Object, required: true })
  shippingAddress: ShippingAddress;

  @Prop({ required: true })
  paymentMethod: PaymentMethod;

  @Prop({ type: [Object], required: true })
  items: Item[];

  @Prop({ required: true })
  subtotal: number;

  @Prop({ required: true })
  shipping: number;

  @Prop({ required: true })
  tax: number;

  @Prop({ required: true })
  total: number;

  @Prop({ default: 'pending' })
  status: OrderStatus;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
OrderSchema.set('toJSON', {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});
