import 'reflect-metadata';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AddressController } from './address.controller';
import { AddressService } from './address.service';

describe('AddressController', () => {
  let controller: AddressController;
  let serviceMock: {
    create: ReturnType<typeof vi.fn>;
    list: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    remove: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    serviceMock = {
      create: vi.fn(),
      list: vi.fn(),
      findOne: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
    };

    controller = new AddressController(
      serviceMock as unknown as AddressService,
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('create', () => {
    it('should call addressService.create with dto and userId', async () => {
      const dto = { city: 'X', country: 'Y' } as any;
      const req = { user: { userId: 'u1' } } as any;
      const created = { _id: 'a1', ...dto };
      serviceMock.create.mockResolvedValue(created);

      const res = await controller.create(dto, req);

      expect(serviceMock.create).toHaveBeenCalledWith(dto, 'u1');
      expect(res).toBe(created);
    });
  });

  describe('list', () => {
    it('should call addressService.list as admin with query and pagination', async () => {
      const req = { user: { userId: 'uadmin', roles: ['admin'] } } as any;
      const result = { items: [], total: 0, page: 2, limit: 5 };
      serviceMock.list.mockResolvedValue(result);

      const res = await controller.list(req, '2', '5', 'CityX', 'CountryY');

      expect(serviceMock.list).toHaveBeenCalledWith(
        { city: 'CityX', country: 'CountryY' },
        req.user,
        true,
        2,
        5,
      );
      expect(res).toBe(result);
    });

    it('should call addressService.list as non-admin and default pagination', async () => {
      const req = { user: { userId: 'u2', roles: [] } } as any;
      const result = { items: [], total: 0, page: 1, limit: 10 };
      serviceMock.list.mockResolvedValue(result);

      const res = await controller.list(
        req,
        undefined as any,
        undefined as any,
        undefined as any,
        undefined as any,
      );

      expect(serviceMock.list).toHaveBeenCalledWith(
        { city: undefined, country: undefined },
        req.user,
        false,
        1,
        10,
      );
      expect(res).toBe(result);
    });
  });

  describe('get', () => {
    it('should call addressService.findOne with id and owner check (non-admin)', async () => {
      const id = 'addr1';
      const req = { user: { userId: 'u1', roles: [] } } as any;
      const addr = { _id: id };
      serviceMock.findOne.mockResolvedValue(addr);

      const res = await controller.get(id, req);

      expect(serviceMock.findOne).toHaveBeenCalledWith(id, req.user, false);
      expect(res).toBe(addr);
    });

    it('should call findOne with admin flag when roles include admin', async () => {
      const id = 'addr2';
      const req = { user: { userId: 'uadmin', roles: ['admin'] } } as any;
      const addr = { _id: id };
      serviceMock.findOne.mockResolvedValue(addr);

      const res = await controller.get(id, req);

      expect(serviceMock.findOne).toHaveBeenCalledWith(id, req.user, true);
      expect(res).toBe(addr);
    });
  });

  describe('update', () => {
    it('should call addressService.update with id, dto and user/isAdmin false', async () => {
      const id = 'a1';
      const dto = { city: 'NewCity' } as any;
      const req = { user: { userId: 'u1', roles: [] } } as any;
      const updated = { _id: id, ...dto };
      serviceMock.update.mockResolvedValue(updated);

      const res = await controller.update(id, dto, req);

      expect(serviceMock.update).toHaveBeenCalledWith(id, dto, req.user, false);
      expect(res).toBe(updated);
    });

    it('should call update as admin when roles include admin', async () => {
      const id = 'a2';
      const dto = { city: 'AdminCity' } as any;
      const req = { user: { userId: 'uadmin', roles: ['admin'] } } as any;
      const updated = { _id: id, ...dto };
      serviceMock.update.mockResolvedValue(updated);

      const res = await controller.update(id, dto, req);

      expect(serviceMock.update).toHaveBeenCalledWith(id, dto, req.user, true);
      expect(res).toBe(updated);
    });
  });

  describe('remove', () => {
    it('should call addressService.remove with id and user/isAdmin false', async () => {
      const id = 'a1';
      const req = { user: { userId: 'u1', roles: [] } } as any;
      const removed = { deleted: true };
      serviceMock.remove.mockResolvedValue(removed);

      const res = await controller.remove(id, req);

      expect(serviceMock.remove).toHaveBeenCalledWith(id, req.user, false);
      expect(res).toBe(removed);
    });

    it('should call remove as admin when roles include admin', async () => {
      const id = 'a2';
      const req = { user: { userId: 'uadmin', roles: ['admin'] } } as any;
      const removed = { deleted: true };
      serviceMock.remove.mockResolvedValue(removed);

      const res = await controller.remove(id, req);

      expect(serviceMock.remove).toHaveBeenCalledWith(id, req.user, true);
      expect(res).toBe(removed);
    });
  });
});
