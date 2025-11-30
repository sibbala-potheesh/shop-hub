import 'reflect-metadata';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

describe('ProductsController', () => {
  let controller: ProductsController;
  let serviceMock: {
    list: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    remove: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    serviceMock = {
      list: vi.fn(),
      findOne: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
    };

    controller = new ProductsController(
      serviceMock as unknown as ProductsService,
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('list', () => {
    it('should list products with pagination', async () => {
      const result = { items: [], total: 0, page: 1, limit: 10 };
      serviceMock.list.mockResolvedValue(result);

      const res = await controller.list({ page: 1, limit: 10 } as any);

      expect(serviceMock.list).toHaveBeenCalledWith(
        { page: 1, limit: 10 },
        1,
        10,
      );
      expect(res).toBe(result);
    });
  });

  describe('get', () => {
    it('should return product by id', async () => {
      const id = 'abc';
      const product = { _id: id, title: 'X' };
      serviceMock.findOne.mockResolvedValue(product);

      const res = await controller.get(id);

      expect(serviceMock.findOne).toHaveBeenCalledWith(id);
      expect(res).toBe(product);
    });
  });

  describe('create', () => {
    it('should create a product', async () => {
      const dto = { title: 'A', price: 10 };
      const created = { _id: '1', ...dto };
      serviceMock.create.mockResolvedValue(created);

      const res = await controller.create(dto as any, {} as any);

      expect(serviceMock.create).toHaveBeenCalledWith(dto);
      expect(res).toBe(created);
    });
  });

  describe('update', () => {
    it('should update product', async () => {
      const id = '1';
      const dto = { title: 'Updated' };
      const updated = { _id: id, ...dto };
      serviceMock.update.mockResolvedValue(updated);

      const res = await controller.update(id, dto as any);

      expect(serviceMock.update).toHaveBeenCalledWith(id, dto);
      expect(res).toBe(updated);
    });
  });

  describe('remove', () => {
    it('should remove product', async () => {
      const id = '1';
      const removed = { success: true };
      serviceMock.remove.mockResolvedValue(removed);

      const res = await controller.remove(id);

      expect(serviceMock.remove).toHaveBeenCalledWith(id);
      expect(res).toBe(removed);
    });
  });
});
