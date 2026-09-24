import { vi } from 'vitest';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from './schemas/user.schema.js';
import { UsersService } from './users.service.js';

describe('UsersService', () => {
  let service: UsersService;
  let findOneMock: ReturnType<typeof vi.fn>;
  let findMock: ReturnType<typeof vi.fn>;
  let updateOneMock: ReturnType<typeof vi.fn>;
  let createMock: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    findOneMock = vi.fn();
    findMock = vi.fn();
    updateOneMock = vi.fn().mockReturnValue({ exec: vi.fn().mockResolvedValue({}) });
    createMock = vi.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: {
            findOne: findOneMock,
            find: findMock,
            findById: vi.fn(),
            updateOne: updateOneMock,
            create: createMock,
          },
        },
      ],
    }).compile();

    service = module.get(UsersService);
  });

  describe('findByMatricNumber', () => {
    it('uppercases and trims the matric number before querying', async () => {
      findOneMock.mockReturnValue({ exec: vi.fn().mockResolvedValue(null) });
      await service.findByMatricNumber('  csc/2019/093  ');
      expect(findOneMock).toHaveBeenCalledWith({ matricNumber: 'CSC/2019/093' });
    });
  });

  describe('findAllPublic', () => {
    it('never exposes passwordHash', async () => {
      findMock.mockReturnValue({
        select: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue([
            { _id: { toString: () => 'u1' }, fullName: 'Ada Lovelace', username: 'ada' },
          ]),
        }),
      });
      const result = await service.findAllPublic();
      expect(result).toEqual([{ id: 'u1', fullName: 'Ada Lovelace', username: 'ada' }]);
      expect(result[0]).not.toHaveProperty('passwordHash');
    });
  });

  describe('setAvatarUrl', () => {
    it('updates only the avatarUrl field', async () => {
      await service.setAvatarUrl('u1', 'data:image/png;base64,xyz');
      expect(updateOneMock).toHaveBeenCalledWith({ _id: 'u1' }, { $set: { avatarUrl: 'data:image/png;base64,xyz' } });
    });
  });

  describe('updateProfile', () => {
    it('updates only the fields provided', async () => {
      await service.updateProfile('u1', { fullName: 'New Name' });
      expect(updateOneMock).toHaveBeenCalledWith({ _id: 'u1' }, { $set: { fullName: 'New Name' } });
    });

    it('updates both fullName and avatarUrl when both are provided', async () => {
      await service.updateProfile('u1', { fullName: 'New Name', avatarUrl: 'data:image/png;base64,xyz' });
      expect(updateOneMock).toHaveBeenCalledWith(
        { _id: 'u1' },
        { $set: { fullName: 'New Name', avatarUrl: 'data:image/png;base64,xyz' } },
      );
    });

    it('does not touch the database when nothing is provided', async () => {
      await service.updateProfile('u1', {});
      expect(updateOneMock).not.toHaveBeenCalled();
    });
  });
});
