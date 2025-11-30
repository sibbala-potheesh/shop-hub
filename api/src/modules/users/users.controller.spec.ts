import 'reflect-metadata';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController (unit)', () => {
  let controller: UsersController;
  let usersServiceMock: {
    listAll: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    usersServiceMock = {
      listAll: vi.fn(),
    };

    controller = new UsersController(
      usersServiceMock as unknown as UsersService,
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('list() should return list of users from UsersService', async () => {
    const mockUsers = [
      { _id: '1', email: 'a@example.com' },
      { _id: '2', email: 'b@example.com' },
    ];

    usersServiceMock.listAll.mockResolvedValue(mockUsers);

    const result = await controller.list();

    expect(usersServiceMock.listAll).toHaveBeenCalled();
    expect(result).toEqual(mockUsers);
  });
});
