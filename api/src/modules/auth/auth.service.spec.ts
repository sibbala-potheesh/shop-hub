import 'reflect-metadata';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

vi.mock('bcrypt', () => ({ compare: vi.fn() }));

import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let usersServiceMock: {
    findByEmail: ReturnType<typeof vi.fn>;
  };
  let jwtServiceMock: {
    sign: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    usersServiceMock = {
      findByEmail: vi.fn(),
    };
    jwtServiceMock = {
      sign: vi.fn().mockReturnValue('signed-token'),
    };

    service = new AuthService(
      usersServiceMock as unknown as UsersService,
      jwtServiceMock as unknown as JwtService,
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('validateUser', () => {
    it('returns null when user not found', async () => {
      usersServiceMock.findByEmail.mockResolvedValue(null);
      const res = await service.validateUser('noone@example.com', 'pw');
      expect(res).toBeNull();
    });

    it('returns null when password does not match', async () => {
      const user = { email: 'a@b.com', password: 'hashed' };
      usersServiceMock.findByEmail.mockResolvedValue(user);
      (bcrypt.compare as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
        false,
      );

      const res = await service.validateUser('a@b.com', 'wrong');
      expect(res).toBeNull();
      expect(bcrypt.compare).toHaveBeenCalledWith('wrong', 'hashed');
    });

    it('returns user without password when credentials valid', async () => {
      const user = {
        id: 'u1',
        email: 'a@b.com',
        password: 'hashed',
        roles: ['user'],
      };
      usersServiceMock.findByEmail.mockResolvedValue(user);
      (bcrypt.compare as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
        true,
      );

      const res = await service.validateUser('a@b.com', 'pw');
      expect(res).toEqual({ id: 'u1', email: 'a@b.com', roles: ['user'] });
    });
  });

  describe('login', () => {
    it('returns accessToken and expiresIn', async () => {
      const user = { id: 'u1', email: 'a@b.com', roles: ['user'] };
      const res = await service.login(user as any);
      expect(jwtServiceMock.sign).toHaveBeenCalledWith({
        email: user.email,
        sub: user.id,
        roles: user.roles,
      });
      expect(res).toEqual({
        accessToken: 'signed-token',
        expiresIn: process.env.JWT_EXPIRES_IN || '3600s',
      });
    });
  });
});
