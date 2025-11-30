import 'reflect-metadata';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

vi.mock('./schemas/address.schema', () => {
  class Address {
    static name = 'Address';
  }
  const AddressDocument = {};
  return { Address, AddressDocument };
});

import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { AddressService } from './address.service';
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
  static updateMany = vi.fn();
}

describe('AddressService', () => {
  let service: AddressService;

  beforeEach(async () => {
    MockModel.find = vi.fn();
    MockModel.countDocuments = vi.fn();
    MockModel.findById = vi.fn();
    MockModel.updateMany = vi.fn();

    const moduleRef = await Test.createTestingModule({
      providers: [
        AddressService,
        { provide: getModelToken('Address'), useValue: MockModel },
      ],
    }).compile();

    service = moduleRef.get(AddressService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('create', () => {
    it('should create address and call updateMany when isDefault true', async () => {
      MockModel.updateMany.mockResolvedValue({ nModified: 1 });
      const dto = { city: 'X', country: 'Y', isDefault: true } as any;
      const ownerId = new Types.ObjectId().toString();
      const res = await service.create(dto, ownerId);
      expect(MockModel.updateMany).toHaveBeenCalledWith(
        { owner: ownerId },
        { $set: { isDefault: false } },
      );
      expect(res.city).toBe('X');
      expect(res.owner.toString()).toBe(ownerId);
    });

    it('should create address without calling updateMany when isDefault false', async () => {
      const dto = { city: 'A', country: 'B', isDefault: false } as any;
      const ownerId = new Types.ObjectId().toString();
      const res = await service.create(dto, ownerId);
      expect(MockModel.updateMany).not.toHaveBeenCalled();
      expect(res.city).toBe('A');
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

    it('should filter by owner when not admin', async () => {
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
    it('should return address when found and owner', async () => {
      const id = new Types.ObjectId().toString();
      const ownerId = new Types.ObjectId().toString();
      const doc = { _id: id, owner: new Types.ObjectId(ownerId) };
      MockModel.findById.mockReturnValue({
        exec: vi.fn().mockResolvedValue(doc),
      });
      const res = await service.findOne(id, { userId: ownerId } as any, false);
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
      const doc = { _id: id, owner: new Types.ObjectId().toString() };
      MockModel.findById.mockReturnValue({
        exec: vi.fn().mockResolvedValue(doc),
      });
      await expect(
        service.findOne(id, { userId: 'other' } as any, false),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });
  });

  describe('update', () => {
    it('should update and save when owner', async () => {
      const id = new Types.ObjectId().toString();
      const ownerId = new Types.ObjectId().toString();
      const doc = new MockModel({
        _id: id,
        owner: new Types.ObjectId(ownerId),
        city: 'Old',
      });
      MockModel.findById.mockReturnValue({
        exec: vi.fn().mockResolvedValue(doc),
      });
      MockModel.updateMany.mockResolvedValue({ nModified: 1 });
      const res = await service.update(
        id,
        { city: 'New', isDefault: true } as any,
        { userId: ownerId } as any,
        false,
      );
      expect(MockModel.updateMany).toHaveBeenCalledWith(
        { owner: doc.owner },
        { $set: { isDefault: false } },
      );
      expect(res.city).toBe('New');
    });

    it('should throw NotFoundException when update target not found', async () => {
      const id = new Types.ObjectId().toString();
      MockModel.findById.mockReturnValue({
        exec: vi.fn().mockResolvedValue(null),
      });
      await expect(
        service.update(id, { city: 'X' } as any, { userId: 'u' } as any, false),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('should throw ForbiddenException when not owner', async () => {
      const id = new Types.ObjectId().toString();
      const doc = { _id: id, owner: new Types.ObjectId().toString() };
      MockModel.findById.mockReturnValue({
        exec: vi.fn().mockResolvedValue(doc),
      });
      await expect(
        service.update(
          id,
          { city: 'X' } as any,
          { userId: 'other' } as any,
          false,
        ),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should delete when owner', async () => {
      const id = new Types.ObjectId().toString();
      const ownerId = new Types.ObjectId().toString();
      const doc = new MockModel({
        _id: id,
        owner: new Types.ObjectId(ownerId),
      });
      MockModel.findById.mockReturnValue({
        exec: vi.fn().mockResolvedValue(doc),
      });
      const res = await service.remove(id, { userId: ownerId } as any, false);
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
      const doc = { _id: id, owner: new Types.ObjectId().toString() };
      MockModel.findById.mockReturnValue({
        exec: vi.fn().mockResolvedValue(doc),
      });
      await expect(
        service.remove(id, { userId: 'other' } as any, false),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });
  });
});
