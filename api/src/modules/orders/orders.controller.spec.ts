import 'reflect-metadata';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

describe('OrdersController', () => {
  let controller: OrdersController;
  let serviceMock: {
    create: ReturnType<typeof vi.fn>;
    list: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
    updateStatus: ReturnType<typeof vi.fn>;
    remove: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    serviceMock = {
      create: vi.fn(),
      list: vi.fn(),
      findOne: vi.fn(),
      updateStatus: vi.fn(),
      remove: vi.fn(),
    };
    controller = new OrdersController(serviceMock as unknown as OrdersService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('create', () => {
    it('should call ordersService.create with dto and userId', async () => {
      const dto = {
        items: [{ productId: 'p1', quantity: 1, price: 10 }],
      } as any;
      const req = { user: { userId: 'u1' } } as any;
      const created = { _id: 'o1' };
      serviceMock.create.mockResolvedValue(created);

      const res = await controller.create(dto, req);

      expect(serviceMock.create).toHaveBeenCalledWith(dto, 'u1');
      expect(res).toBe(created);
    });
  });

  describe('list', () => {
    it('should call ordersService.list as admin (see all)', async () => {
      const query = { page: 2, limit: 5 } as any;
      const req = { user: { userId: 'uadmin', roles: ['admin'] } } as any;
      const result = { items: [], total: 0, page: 2, limit: 5 };
      serviceMock.list.mockResolvedValue(result);

      const res = await controller.list(query, req);

      expect(serviceMock.list).toHaveBeenCalledWith(
        query,
        req.user,
        true,
        2,
        5,
      );
      expect(res).toBe(result);
    });

    it('should call ordersService.list as non-admin (filtered by user)', async () => {
      const query = {} as any;
      const req = { user: { userId: 'u2', roles: [] } } as any;
      const result = { items: [], total: 0, page: 1, limit: 10 };
      serviceMock.list.mockResolvedValue(result);

      const res = await controller.list(query, req);

      expect(serviceMock.list).toHaveBeenCalledWith(
        query,
        req.user,
        false,
        1,
        10,
      );
      expect(res).toBe(result);
    });
  });

  describe('get', () => {
    it('should call ordersService.findOne with id and isAdmin flag', async () => {
      const id = 'ord1';
      const req = { user: { userId: 'u1', roles: [] } } as any;
      const order = { _id: id };
      serviceMock.findOne.mockResolvedValue(order);

      const res = await controller.get(id, req);

      expect(serviceMock.findOne).toHaveBeenCalledWith(id, req.user, false);
      expect(res).toBe(order);
    });

    it('should treat user with admin role as admin', async () => {
      const id = 'ord2';
      const req = { user: { userId: 'uadmin', roles: ['admin'] } } as any;
      const order = { _id: id };
      serviceMock.findOne.mockResolvedValue(order);

      const res = await controller.get(id, req);

      expect(serviceMock.findOne).toHaveBeenCalledWith(id, req.user, true);
      expect(res).toBe(order);
    });
  });

  describe('updateStatus', () => {
    it('should call ordersService.updateStatus with id, status and user/isAdmin', async () => {
      const id = 'ord1';
      const dto = { status: 'shipped' } as any;
      const req = { user: { userId: 'u1', roles: [] } } as any;
      const updated = { _id: id, status: 'shipped' };
      serviceMock.updateStatus.mockResolvedValue(updated);

      const res = await controller.updateStatus(id, dto, req);

      expect(serviceMock.updateStatus).toHaveBeenCalledWith(
        id,
        dto.status,
        req.user,
        false,
      );
      expect(res).toBe(updated);
    });

    it('should call updateStatus as admin when roles include admin', async () => {
      const id = 'ord2';
      const dto = { status: 'delivered' } as any;
      const req = { user: { userId: 'uadmin', roles: ['admin'] } } as any;
      const updated = { _id: id, status: 'delivered' };
      serviceMock.updateStatus.mockResolvedValue(updated);

      const res = await controller.updateStatus(id, dto, req);

      expect(serviceMock.updateStatus).toHaveBeenCalledWith(
        id,
        dto.status,
        req.user,
        true,
      );
      expect(res).toBe(updated);
    });
  });

  describe('remove', () => {
    it('should call ordersService.remove with id and user/isAdmin', async () => {
      const id = 'ord1';
      const req = { user: { userId: 'u1', roles: [] } } as any;
      const removed = { deleted: true };
      serviceMock.remove.mockResolvedValue(removed);

      const res = await controller.remove(id, req);

      expect(serviceMock.remove).toHaveBeenCalledWith(id, req.user, false);
      expect(res).toBe(removed);
    });

    it('should call remove as admin when roles include admin', async () => {
      const id = 'ord2';
      const req = { user: { userId: 'uadmin', roles: ['admin'] } } as any;
      const removed = { deleted: true };
      serviceMock.remove.mockResolvedValue(removed);

      const res = await controller.remove(id, req);

      expect(serviceMock.remove).toHaveBeenCalledWith(id, req.user, true);
      expect(res).toBe(removed);
    });
  });
});
