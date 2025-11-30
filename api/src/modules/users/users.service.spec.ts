// api/src/modules/users/users.service.spec.ts
import 'reflect-metadata';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// ---- MOCK THE SCHEMA MODULE BEFORE importing the service ----
vi.mock('./schemas/user.schema', () => {
  class User {
    static name = 'User';
  }
  const UserDocument = {};
  return {
    User,
    UserDocument,
  };
});

// ---- MOCK bcrypt MODULE BEFORE importing it (fixes ESM non-configurable exports) ----
vi.mock('bcrypt', () => {
  return {
    // Provide a mockable hash function
    hash: vi.fn(),
  };
});

// Now import the mocked bcrypt and other test deps
import * as bcrypt from 'bcrypt';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { ConflictException } from '@nestjs/common';

/** Minimal MockModel that supports the patterns used by UsersService */
class MockModel {
  [k: string]: any;
  constructor(data?: any) {
    if (data) Object.assign(this, data);
    this.save = vi.fn().mockImplementation(() => Promise.resolve(this));
  }
  save!: () => Promise<any>;

  // static placeholders to be reset in beforeEach
  static findOne = vi.fn();
  static findById = vi.fn();
  static find = vi.fn();
}

describe('UsersService (unit) - schema & bcrypt mocked', () => {
  let service: UsersService;

  const sampleDto = {
    email: 'alice@example.com',
    password: 'plaintext',
    firstName: 'Alice',
  };

  beforeEach(async () => {
    // reset static mocks before each test
    MockModel.findOne = vi.fn();
    MockModel.findById = vi.fn();
    MockModel.find = vi.fn();

    // Reset bcrypt mock implementation between tests
    (bcrypt.hash as unknown as ReturnType<typeof vi.fn>).mockReset();

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          // use the same token your service expects: getModelToken(User.name) -> 'User'
          provide: getModelToken('User'),
          useValue: MockModel,
        },
      ],
    }).compile();

    service = moduleRef.get<UsersService>(UsersService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('create() should save a new user with hashed password when email is free', async () => {
    MockModel.findOne.mockReturnValue({
      exec: vi.fn().mockResolvedValue(null),
    });

    // set bcrypt.hash mock to resolve to a hashed string
    (bcrypt.hash as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      'hashed-password',
    );

    const created = await service.create(sampleDto as any, 10);

    expect(created).toBeDefined();
    expect(created.email).toBe(sampleDto.email);
    expect(created.password).toBe('hashed-password');
    expect(MockModel.findOne).toHaveBeenCalledWith({ email: sampleDto.email });
    expect(
      (bcrypt.hash as unknown as ReturnType<typeof vi.fn>).mock.calls.length,
    ).toBeGreaterThan(0);
    expect(
      (bcrypt.hash as unknown as ReturnType<typeof vi.fn>).mock.calls[0],
    ).toEqual([sampleDto.password, 10]);
  });

  it('create() should throw ConflictException when email already exists', async () => {
    const fakeExisting = { _id: '1', email: sampleDto.email, password: 'x' };
    MockModel.findOne.mockReturnValue({
      exec: vi.fn().mockResolvedValue(fakeExisting),
    });

    // ensure bcrypt.hash mock remains unused (but set anyway or leave as reset)
    (bcrypt.hash as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      'will-not-be-used',
    );

    await expect(service.create(sampleDto as any, 10)).rejects.toBeInstanceOf(
      ConflictException,
    );

    // bcrypt.hash should not have been called
    expect(
      (bcrypt.hash as unknown as ReturnType<typeof vi.fn>).mock.calls.length,
    ).toBe(0);
  });

  it('findByEmail() should return user via lean()', async () => {
    const fake = { _id: '1', email: 'bob@example.com', firstName: 'Bob' };
    MockModel.findOne.mockReturnValue({
      lean: vi.fn().mockResolvedValue(fake),
    });

    const found = await service.findByEmail('bob@example.com');

    expect(MockModel.findOne).toHaveBeenCalledWith({
      email: 'bob@example.com',
    });
    expect(found).toEqual(fake);
  });

  it('findById() should return user via exec()', async () => {
    const fake = { _id: 'abc123', email: 'c@example.com' };
    MockModel.findById.mockReturnValue({
      exec: vi.fn().mockResolvedValue(fake),
    });

    const found = await service.findById('abc123');

    expect(MockModel.findById).toHaveBeenCalledWith('abc123');
    expect(found).toEqual(fake);
  });

  it('ensureAdminUser() should create admin when no users exist', async () => {
    MockModel.findOne.mockReturnValue({
      exec: vi.fn().mockResolvedValue(null),
    });

    (bcrypt.hash as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      'admin-hashed',
    );

    const result = await service.ensureAdminUser('admin@example.com', 'pw', 8);

    expect(MockModel.findOne).toHaveBeenCalledWith({});
    expect(
      (bcrypt.hash as unknown as ReturnType<typeof vi.fn>).mock.calls[0],
    ).toEqual(['pw', 8]);
    expect(result).not.toBeNull();
    expect(result).toBeDefined();
    expect(result!.email).toBe('admin@example.com');
    expect(result!.roles).toEqual(['admin', 'user']);
    expect(result!.password).toBe('admin-hashed');
  });

  it('ensureAdminUser() should return null if any user exists', async () => {
    MockModel.findOne.mockReturnValue({
      exec: vi.fn().mockResolvedValue({ _id: 'x' }),
    });

    const res = await service.ensureAdminUser('admin@example.com', 'pw', 8);
    expect(res).toBeNull();
  });

  it('listAll() should return users without password (select -password)', async () => {
    const users = [
      { _id: '1', email: 'a' },
      { _id: '2', email: 'b' },
    ];
    MockModel.find.mockReturnValue({
      select: vi
        .fn()
        .mockReturnValue({ exec: vi.fn().mockResolvedValue(users) }),
    });

    const result = await service.listAll();

    expect(MockModel.find).toHaveBeenCalled();
    expect(result).toEqual(users);
  });
});
