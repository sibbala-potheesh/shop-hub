import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { Model, Types } from 'mongoose';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async create(dto: CreateProductDto) {
    const created = new this.productModel(dto);
    return created.save();
  }

  async list(query: any, page = 1, limit = 10) {
    const filter: any = {};
    if (query.category) filter.category = query.category;
    if (query.minPrice)
      filter.price = { ...(filter.price || {}), $gte: Number(query.minPrice) };
    if (query.maxPrice)
      filter.price = { ...(filter.price || {}), $lte: Number(query.maxPrice) };
    if (query.q) filter.title = { $regex: query.q, $options: 'i' };
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.productModel.find(filter).skip(skip).limit(limit).exec(),
      this.productModel.countDocuments(filter).exec(),
    ]);
    return { items, total, page, limit };
  }

  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id))
      throw new NotFoundException('Product not found');
    const p = await this.productModel.findById(id).exec();
    if (!p) throw new NotFoundException('Product not found');
    return p;
  }

  async update(id: string, dto: UpdateProductDto) {
    const p = await this.findOne(id);
    Object.assign(p, dto);
    return p.save();
  }

  async remove(id: string) {
    const p = await this.findOne(id);
    return p.deleteOne();
  }

  async decrementStock(productId: string, quantity: number, session?: any) {
    // Use atomic $inc with validation
    const filter = { _id: productId, stock: { $gte: quantity } };
    const update = { $inc: { stock: -quantity } };
    const options = { session, new: true };
    const updated = await this.productModel
      .findOneAndUpdate(filter, update, options)
      .exec();
    if (!updated) {
      throw new ForbiddenException(
        `Insufficient stock for product ${productId}`,
      );
    }
    return updated;
  }
}
