import 'reflect-metadata';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

vi.mock('./schemas/product.schema', () => {
  class Product {
    static name = 'Product';
  }
  const ProductDocument = {};
  return { Product, ProductDocument };
});

import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ProductsService } from './products.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { Types } from 'mongoose';

class MockModel {
  [k: string]: any;

  constructor(data?: any) {
    if (data) Object.assign(this, data);
    this.save = vi.fn().mockResolvedValue(this);
    this.deleteOne = vi.fn().mockResolvedValue({ deleted: true });
  }

  save!: () => Promise<any>;
  deleteOne!: () => Promise<any>;

  static find = vi.fn();
  static countDocuments = vi.fn();
  static findById = vi.fn();
  static findOneAndUpdate = vi.fn();
}

describe('ProductsService', () => {
  let service: ProductsService;

  beforeEach(async () => {
    MockModel.find = vi.fn();
    MockModel.countDocuments = vi.fn();
    MockModel.findById = vi.fn();
    MockModel.findOneAndUpdate = vi.fn();

    const moduleRef = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: getModelToken('Product'), useValue: MockModel },
      ],
    }).compile();

    service = moduleRef.get(ProductsService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('create', async () => {
    const dto = { title: 'X', price: 10 };
    const result = await service.create(dto as any);
    expect(result.title).toBe('X');
    expect(result.price).toBe(10);
  });

  it('list', async () => {
    const items = [{ title: 'A' }, { title: 'B' }];
    MockModel.find.mockReturnValue({
      skip: vi.fn().mockReturnThis(),
      limit: vi
        .fn()
        .mockReturnValue({ exec: vi.fn().mockResolvedValue(items) }),
    });
    MockModel.countDocuments.mockReturnValue({
      exec: vi.fn().mockResolvedValue(2),
    });

    const res = await service.list({}, 1, 10);
    expect(res.items).toEqual(items);
    expect(res.total).toBe(2);
  });

  it('findOne success', async () => {
    const id = new Types.ObjectId().toString();
    const doc = { _id: id, title: 'X' };
    MockModel.findById.mockReturnValue({
      exec: vi.fn().mockResolvedValue(doc),
    });

    const res = await service.findOne(id);
    expect(res).toEqual(doc);
  });

  it('findOne invalid id', async () => {
    await expect(service.findOne('bad-id')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('findOne not found', async () => {
    const id = new Types.ObjectId().toString();
    MockModel.findById.mockReturnValue({
      exec: vi.fn().mockResolvedValue(null),
    });
    await expect(service.findOne(id)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('update', async () => {
    const id = new Types.ObjectId().toString();
    const doc = new MockModel({ _id: id, title: 'Old', price: 10 });
    MockModel.findById.mockReturnValue({
      exec: vi.fn().mockResolvedValue(doc),
    });

    const res = await service.update(id, { title: 'New' } as any);
    expect(res.title).toBe('New');
  });

  it('remove', async () => {
    const id = new Types.ObjectId().toString();
    const doc = new MockModel({ _id: id });
    MockModel.findById.mockReturnValue({
      exec: vi.fn().mockResolvedValue(doc),
    });

    const res = await service.remove(id);
    expect(res).toEqual({ deleted: true });
  });

  it('decrementStock success', async () => {
    const productId = new Types.ObjectId().toString();
    const updated = { _id: productId, stock: 5 };
    MockModel.findOneAndUpdate.mockReturnValue({
      exec: vi.fn().mockResolvedValue(updated),
    });

    const res = await service.decrementStock(productId, 2);
    expect(res).toEqual(updated);
  });

  it('decrementStock insufficient', async () => {
    const productId = new Types.ObjectId().toString();
    MockModel.findOneAndUpdate.mockReturnValue({
      exec: vi.fn().mockResolvedValue(null),
    });

    await expect(service.decrementStock(productId, 10)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });
});
