import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { Model, Connection, ClientSession } from 'mongoose';
import { CreateOrderDto } from './dto/create-order.dto';
import { ProductsService } from '../products/products.service';
import { InjectConnection } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private productsService: ProductsService,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  private round2(n: number) {
    return Math.round(n * 100) / 100;
  }

  async create(dto: CreateOrderDto, userId: string) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Items cannot be empty');
    }

    // Calculate subtotal from client price snapshots (server trusts passed price, but we could re-lookup prices)
    const subtotal = this.round2(
      dto.items.reduce((s, it) => s + it.price * it.quantity, 0),
    );
    const shipping = typeof dto.shipping === 'number' ? dto.shipping : 15;
    const tax =
      typeof dto.tax === 'number' ? dto.tax : this.round2(subtotal * 0.1);
    const total = this.round2(subtotal + shipping + tax);

    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      // For each item, ensure stock available and decrement atomically using product service with session
      for (const it of dto.items) {
        await this.productsService.decrementStock(
          it.productId,
          it.quantity,
          session,
        );
      }

      const order = new this.orderModel({
        contact: dto.contact,
        shippingAddress: dto.shippingAddress,
        paymentMethod: dto.paymentMethod,
        items: dto.items.map((it) => ({
          productId: new Types.ObjectId(it.productId),
          title: it.title,
          price: it.price,
          quantity: it.quantity,
        })),
        subtotal,
        shipping,
        tax,
        total,
        user: new Types.ObjectId(userId),
      });

      await order.save({ session });
      await session.commitTransaction();
      session.endSession();
      return order;
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
  }

  async list(query: any, user: any, isAdmin: boolean, page = 1, limit = 10) {
    const filter: any = {};
    if (!isAdmin) filter.user = user.userId;
    if (query.status) filter.status = query.status;
    if (query.email) filter['contact.email'] = query.email;
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.orderModel.find(filter).skip(skip).limit(limit).exec(),
      this.orderModel.countDocuments(filter).exec(),
    ]);
    return { items, total, page, limit };
  }

  async findOne(id: string, user: any, isAdmin: boolean) {
    const order = await this.orderModel.findById(id).exec();
    if (!order) throw new NotFoundException('Order not found');
    if (!isAdmin && order.user.toString() !== user.userId) {
      throw new ForbiddenException('Not owner');
    }
    return order;
  }

  async updateStatus(id: string, status: string, user: any, isAdmin: boolean) {
    const order = await this.orderModel.findById(id).exec();
    if (!order) throw new NotFoundException('Order not found');
    // Only allow status change if admin or owner (optionally restrict)
    if (!isAdmin && order.user.toString() !== user.userId) {
      throw new ForbiddenException('Not allowed to update status');
    }

    // Simple allowed transitions (could be expanded)
    const allowed = [
      'pending',
      'processing',
      'shipped',
      'delivered',
      'cancelled',
    ];
    if (!allowed.includes(status)) {
      throw new BadRequestException('Invalid status');
    }
    order.status = status as any;
    return order.save();
  }

  async remove(id: string, user: any, isAdmin: boolean) {
    const order = await this.orderModel.findById(id).exec();
    if (!order) throw new NotFoundException('Order not found');
    if (!isAdmin && order.user.toString() !== user.userId) {
      throw new ForbiddenException('Not allowed to delete');
    }
    if (!['pending', 'cancelled'].includes(order.status)) {
      throw new BadRequestException(
        'Only pending or cancelled orders can be deleted',
      );
    }
    return order.deleteOne();
  }
}
