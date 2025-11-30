import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  password: string; // hashed

  @Prop()
  firstName?: string;

  @Prop()
  lastName?: string;

  @Prop({ type: [String], default: ['user'] })
  roles?: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);

// Ensure password is not returned in toJSON
UserSchema.set('toJSON', {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});
