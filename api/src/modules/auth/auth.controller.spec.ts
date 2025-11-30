import 'reflect-metadata';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

describe('AuthController', () => {
  let controller: AuthController;
  let usersServiceMock: {
    create: ReturnType<typeof vi.fn>;
    findByEmail: ReturnType<typeof vi.fn>;
    findById: ReturnType<typeof vi.fn>;
  };
  let authServiceMock: {
    validateUser: ReturnType<typeof vi.fn>;
    login: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    usersServiceMock = {
      create: vi.fn(),
      findByEmail: vi.fn(),
      findById: vi.fn(),
    };

    authServiceMock = {
      validateUser: vi.fn(),
      login: vi.fn(),
    };

    controller = new AuthController(
      authServiceMock as unknown as AuthService,
      usersServiceMock as unknown as UsersService,
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.BCRYPT_SALT_ROUNDS;
  });

  describe('register', () => {
    it('should call usersService.create and return safe user', async () => {
      process.env.BCRYPT_SALT_ROUNDS = '12';
      const dto = { email: 'a@b.com', password: 'pw', firstName: 'A' } as any;
      const saved = {
        _id: 'u1',
        email: dto.email,
        password: 'hashed',
        firstName: 'A',
      } as any;
      usersServiceMock.create.mockResolvedValue(saved);

      const res = await controller.register(dto);

      expect(usersServiceMock.create).toHaveBeenCalledWith(dto, 12);
      expect(res).not.toHaveProperty('password');
      expect(res.email).toBe(dto.email);
    });
  });

  describe('login', () => {
    it('should throw BadRequestException when user not found', async () => {
      usersServiceMock.findByEmail.mockResolvedValue(null);
      await expect(
        controller.login({ email: 'x', password: 'y' } as any),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('should throw BadRequestException when credentials invalid', async () => {
      const user = { _id: 'u1', email: 'a@b.com', password: 'hashed' } as any;
      usersServiceMock.findByEmail.mockResolvedValue(user);
      authServiceMock.validateUser.mockResolvedValue(null);
      await expect(
        controller.login({ email: 'a@b.com', password: 'wrong' } as any),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('should return token and user when credentials valid', async () => {
      const userDoc = {
        _id: { toString: () => 'u1' },
        email: 'a@b.com',
        password: 'hashed',
        toJSON: () => ({ _id: 'u1', email: 'a@b.com', password: 'hashed' }),
      } as any;
      usersServiceMock.findByEmail.mockResolvedValue(userDoc);
      authServiceMock.validateUser.mockResolvedValue({
        id: 'u1',
        email: 'a@b.com',
      });
      const tokenObj = { accessToken: 't' };
      authServiceMock.login.mockResolvedValue(tokenObj);

      const res = await controller.login({
        email: 'a@b.com',
        password: 'pw',
      } as any);

      expect(usersServiceMock.findByEmail).toHaveBeenCalledWith('a@b.com');
      expect(authServiceMock.validateUser).toHaveBeenCalledWith(
        'a@b.com',
        'pw',
      );
      expect(authServiceMock.login).toHaveBeenCalledWith(userDoc);
      expect(res.token).toBe(tokenObj);
      expect(res.user.id).toBe('u1');
      expect(res.user.password).toBeUndefined();
    });
  });

  describe('profile', () => {
    it('should return safe user when found', async () => {
      const user = { _id: 'u1', email: 'a@b.com', password: 'hashed' } as any;
      usersServiceMock.findById.mockResolvedValue(user);
      const req = { user: { userId: 'u1' } } as any;

      const res = await controller.profile(req);

      expect(usersServiceMock.findById).toHaveBeenCalledWith('u1');
      expect(res).not.toHaveProperty('password');
      expect(res.email).toBe('a@b.com');
    });

    it('should throw BadRequestException when user not found', async () => {
      usersServiceMock.findById.mockResolvedValue(null);
      const req = { user: { userId: 'u1' } } as any;
      await expect(controller.profile(req)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });
  });
});
