import 'reflect-metadata';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

vi.mock('./schemas/order.schema', () => {
  class Order {
    static name = 'Order';
  }
  const OrderDocument = {};
  return { Order, OrderDocument };
});

vi.mock('../products/products.service', () => {
  return {
    ProductsService: class ProductsServiceMock {},
  };
});

import { Test } from '@nestjs/testing';
import { getModelToken, getConnectionToken } from '@nestjs/mongoose';
import { OrdersService } from './orders.service';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { ProductsService } from '../products/products.service';

class MockModel {
  [k: string]: any;
  constructor(data?: any) {
    if (data) Object.assign(this, data);
    this.save = vi
      .fn()
      .mockImplementation((opts?: any) => Promise.resolve(this));
    this.deleteOne = vi.fn().mockResolvedValue({ deleted: true });
  }
  save!: (opts?: any) => Promise<any>;
  deleteOne!: () => Promise<any>;
  static find = vi.fn();
  static countDocuments = vi.fn();
  static findById = vi.fn();
}

describe('OrdersService', () => {
  let service: OrdersService;
  let productsServiceMock: {
    decrementStock: ReturnType<typeof vi.fn>;
  };
  let connectionMock: any;

  beforeEach(async () => {
    MockModel.find = vi.fn();
    MockModel.countDocuments = vi.fn();
    MockModel.findById = vi.fn();

    productsServiceMock = {
      decrementStock: vi.fn(),
    };

    const session = {
      startTransaction: vi.fn(),
      commitTransaction: vi.fn(),
      abortTransaction: vi.fn(),
      endSession: vi.fn(),
    };
    connectionMock = {
      startSession: vi.fn().mockResolvedValue(session),
    };

    // instantiate OrdersService directly to avoid DI/token issues in tests
    service = new OrdersService(
      MockModel as unknown as any,
      productsServiceMock as unknown as any,
      connectionMock as unknown as any,
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('create', () => {
    it('should throw when items empty', async () => {
      await expect(
        service.create({ items: [] } as any, 'u1'),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('should create order and commit transaction', async () => {
      productsServiceMock.decrementStock.mockResolvedValue({});

      const dto = {
        items: [
          {
            productId: new Types.ObjectId().toString(),
            title: 'P',
            price: 10,
            quantity: 2,
          },
        ],
        contact: { email: 'a@b.com' },
        shippingAddress: {},
        paymentMethod: 'card',
      } as any;

      const order = await service.create(dto, new Types.ObjectId().toString());

      expect(productsServiceMock.decrementStock).toHaveBeenCalled();
      expect(connectionMock.startSession).toHaveBeenCalled();
      expect(order).toBeDefined();
      expect(order.items?.length).toBe(1);
    });

    it('should abort and rethrow when decrementStock fails', async () => {
      productsServiceMock.decrementStock.mockRejectedValue(
        new Error('no stock'),
      );

      const dto = {
        items: [
          {
            productId: new Types.ObjectId().toString(),
            title: 'P',
            price: 10,
            quantity: 2,
          },
        ],
        contact: { email: 'a@b.com' },
        shippingAddress: {},
        paymentMethod: 'card',
      } as any;

      await expect(
        service.create(dto, new Types.ObjectId().toString()),
      ).rejects.toThrow('no stock');
      const session = await connectionMock.startSession();
      expect(session.abortTransaction).toHaveBeenCalled();
      expect(session.endSession).toHaveBeenCalled();
    });
  });

  describe('list', () => {
    it('should return items and total for admin', async () => {
      const items = [{}, {}];
      MockModel.find.mockReturnValue({
        skip: vi.fn().mockReturnThis(),
        limit: vi
          .fn()
          .mockReturnValue({ exec: vi.fn().mockResolvedValue(items) }),
      });
      MockModel.countDocuments.mockReturnValue({
        exec: vi.fn().mockResolvedValue(2),
      });

      const res = await service.list({}, { userId: 'u' } as any, true, 1, 10);
      expect(res.items).toEqual(items);
      expect(res.total).toBe(2);
    });

    it('should filter by user when not admin', async () => {
      const items = [{}];
      MockModel.find.mockReturnValue({
        skip: vi.fn().mockReturnThis(),
        limit: vi
          .fn()
          .mockReturnValue({ exec: vi.fn().mockResolvedValue(items) }),
      });
      MockModel.countDocuments.mockReturnValue({
        exec: vi.fn().mockResolvedValue(1),
      });

      const res = await service.list({}, { userId: 'u1' } as any, false, 1, 10);
      expect(res.items).toEqual(items);
      expect(res.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return order when found and owner', async () => {
      const id = new Types.ObjectId().toString();
      const doc = { _id: id, user: new Types.ObjectId().toString() };
      MockModel.findById.mockReturnValue({
        exec: vi.fn().mockResolvedValue(doc),
      });

      const res = await service.findOne(id, { userId: doc.user } as any, false);
      expect(res).toEqual(doc);
    });

    it('should throw NotFoundException when not found', async () => {
      const id = new Types.ObjectId().toString();
      MockModel.findById.mockReturnValue({
        exec: vi.fn().mockResolvedValue(null),
      });
      await expect(
        service.findOne(id, { userId: 'u' } as any, false),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('should throw ForbiddenException when not owner', async () => {
      const id = new Types.ObjectId().toString();
      const doc = { _id: id, user: new Types.ObjectId().toString() };
      MockModel.findById.mockReturnValue({
        exec: vi.fn().mockResolvedValue(doc),
      });
      await expect(
        service.findOne(id, { userId: 'other' } as any, false),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });
  });

  describe('updateStatus', () => {
    it('should update status when allowed', async () => {
      const id = new Types.ObjectId().toString();
      const userId = new Types.ObjectId().toString();
      const doc = {
        _id: id,
        user: userId,
        status: 'pending',
        save: vi.fn().mockResolvedValue({ _id: id, status: 'processing' }),
      };
      MockModel.findById.mockReturnValue({
        exec: vi.fn().mockResolvedValue(doc),
      });

      const res = await service.updateStatus(
        id,
        'processing',
        { userId } as any,
        false,
      );
      expect(doc.save).toHaveBeenCalled();
      expect(res.status).toBe('processing');
    });

    it('should throw NotFoundException when not found', async () => {
      const id = new Types.ObjectId().toString();
      MockModel.findById.mockReturnValue({
        exec: vi.fn().mockResolvedValue(null),
      });
      await expect(
        service.updateStatus(id, 'shipped', { userId: 'u' } as any, true),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('should throw BadRequestException for invalid status', async () => {
      const id = new Types.ObjectId().toString();
      const userId = new Types.ObjectId().toString();
      const doc = {
        _id: id,
        user: userId,
        status: 'pending',
        save: vi.fn().mockResolvedValue({}),
      };
      MockModel.findById.mockReturnValue({
        exec: vi.fn().mockResolvedValue(doc),
      });
      await expect(
        service.updateStatus(id, 'invalid-status', { userId } as any, true),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('should throw ForbiddenException when not allowed to update', async () => {
      const id = new Types.ObjectId().toString();
      const doc = { _id: id, user: new Types.ObjectId().toString() };
      MockModel.findById.mockReturnValue({
        exec: vi.fn().mockResolvedValue(doc),
      });
      await expect(
        service.updateStatus(
          id,
          'processing',
          { userId: 'other' } as any,
          false,
        ),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should delete when pending or cancelled and owner', async () => {
      const id = new Types.ObjectId().toString();
      const userId = new Types.ObjectId().toString();
      const doc = {
        _id: id,
        user: userId,
        status: 'pending',
        deleteOne: vi.fn().mockResolvedValue({ deleted: true }),
      };
      MockModel.findById.mockReturnValue({
        exec: vi.fn().mockResolvedValue(doc),
      });

      const res = await service.remove(id, { userId } as any, false);
      expect(doc.deleteOne).toHaveBeenCalled();
      expect(res).toEqual({ deleted: true });
    });

    it('should throw NotFoundException when not found', async () => {
      const id = new Types.ObjectId().toString();
      MockModel.findById.mockReturnValue({
        exec: vi.fn().mockResolvedValue(null),
      });
      await expect(
        service.remove(id, { userId: 'u' } as any, true),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('should throw ForbiddenException when not owner', async () => {
      const id = new Types.ObjectId().toString();
      const doc = {
        _id: id,
        user: new Types.ObjectId().toString(),
        status: 'pending',
      };
      MockModel.findById.mockReturnValue({
        exec: vi.fn().mockResolvedValue(doc),
      });
      await expect(
        service.remove(id, { userId: 'other' } as any, false),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('should throw BadRequestException when status not deletable', async () => {
      const id = new Types.ObjectId().toString();
      const userId = new Types.ObjectId().toString();
      const doc = { _id: id, user: userId, status: 'shipped' };
      MockModel.findById.mockReturnValue({
        exec: vi.fn().mockResolvedValue(doc),
      });
      await expect(
        service.remove(id, { userId } as any, false),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });
});
