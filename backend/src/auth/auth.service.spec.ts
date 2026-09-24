import { vi } from 'vitest';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service.js';
import { AuthService } from './auth.service.js';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: {
    findByMatricNumber: ReturnType<typeof vi.fn>;
    findByUsername: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
  };
  let jwtService: { sign: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    usersService = {
      findByMatricNumber: vi.fn(),
      findByUsername: vi.fn(),
      create: vi.fn(),
    };
    jwtService = { sign: vi.fn().mockReturnValue('signed-token') };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  describe('register', () => {
    it('rejects a duplicate matric number', async () => {
      usersService.findByMatricNumber.mockResolvedValue({ id: 'existing' });
      usersService.findByUsername.mockResolvedValue(null);

      await expect(
        service.register({ matricNumber: 'CSC/2019/093', fullName: 'Ada', username: 'ada', password: 'password123' }),
      ).rejects.toThrow(ConflictException);
      expect(usersService.create).not.toHaveBeenCalled();
    });

    it('rejects a duplicate username', async () => {
      usersService.findByMatricNumber.mockResolvedValue(null);
      usersService.findByUsername.mockResolvedValue({ id: 'existing' });

      await expect(
        service.register({ matricNumber: 'CSC/2019/093', fullName: 'Ada', username: 'ada', password: 'password123' }),
      ).rejects.toThrow(ConflictException);
    });

    it('hashes the password and issues a token', async () => {
      usersService.findByMatricNumber.mockResolvedValue(null);
      usersService.findByUsername.mockResolvedValue(null);
      usersService.create.mockResolvedValue({
        id: 'user-1',
        fullName: 'Ada',
        username: 'ada',
        matricNumber: 'CSC/2019/093',
      });

      const result = await service.register({
        matricNumber: 'CSC/2019/093',
        fullName: 'Ada',
        username: 'ada',
        password: 'password123',
      });

      const createArg = usersService.create.mock.calls[0][0];
      expect(createArg.passwordHash).not.toBe('password123');
      expect(await bcrypt.compare('password123', createArg.passwordHash)).toBe(true);
      expect(result).toEqual({
        accessToken: 'signed-token',
        user: { id: 'user-1', fullName: 'Ada', username: 'ada', matricNumber: 'CSC/2019/093' },
      });
    });
  });

  describe('login', () => {
    it('rejects an unknown matric number', async () => {
      usersService.findByMatricNumber.mockResolvedValue(null);
      await expect(service.login({ matricNumber: 'CSC/2019/999', password: 'password123' })).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('rejects a suspended account', async () => {
      usersService.findByMatricNumber.mockResolvedValue({ suspended: true, passwordHash: 'hash' });
      await expect(service.login({ matricNumber: 'CSC/2019/093', password: 'password123' })).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('rejects an incorrect password', async () => {
      const passwordHash = await bcrypt.hash('correct-password', 4);
      usersService.findByMatricNumber.mockResolvedValue({ suspended: false, passwordHash });
      await expect(service.login({ matricNumber: 'CSC/2019/093', password: 'wrong-password' })).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('issues a token for a correct password', async () => {
      const passwordHash = await bcrypt.hash('correct-password', 4);
      usersService.findByMatricNumber.mockResolvedValue({
        id: 'user-1',
        fullName: 'Ada',
        username: 'ada',
        matricNumber: 'CSC/2019/093',
        suspended: false,
        passwordHash,
      });

      const result = await service.login({ matricNumber: 'CSC/2019/093', password: 'correct-password' });
      expect(result.accessToken).toBe('signed-token');
    });
  });
});
