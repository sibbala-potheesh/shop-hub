import mongoose from 'mongoose';

export function isValidObjectId(id: any): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}
