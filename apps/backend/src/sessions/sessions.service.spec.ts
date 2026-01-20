import { Test, TestingModule } from '@nestjs/testing';
import { SessionsService } from './sessions.service';
import { getModelToken } from '@nestjs/mongoose';
import { DATABASE_CONSTANTS } from 'src/config/constants';
import Redis from 'ioredis';

describe('SessionsService', () => {
  let service: SessionsService;
  let mockRedisClient: any;
  let mockUserModel: any;

  const mockUserId = '507f1f77bcf86cd799439011';
  const mockSessionId = 'sess_abc123def456';

  beforeEach(async () => {
    mockRedisClient = {
      setEx: jest.fn().mockResolvedValue('OK'),
      get: jest.fn(),
      del: jest.fn().mockResolvedValue(1),
      sAdd: jest.fn().mockResolvedValue(1),
      sRem: jest.fn().mockResolvedValue(1),
      sadd: jest.fn().mockResolvedValue(1),
      srem: jest.fn().mockResolvedValue(1),
      smembers: jest.fn().mockResolvedValue([]),
      expire: jest.fn().mockResolvedValue(1),
    };

    mockUserModel = {
      findById: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionsService,
        {
          provide: getModelToken(DATABASE_CONSTANTS.SCHEMAS.USER),
          useValue: mockUserModel,
        },
        {
          provide: 'REDIS_CLIENT',
          useValue: mockRedisClient,
        },
      ],
    }).compile();

    service = module.get<SessionsService>(SessionsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('saveSession', () => {
    it('should save session with TTL', async () => {
      mockRedisClient.sadd.mockResolvedValueOnce(1);
      mockRedisClient.expire.mockResolvedValueOnce(1);

      await service.saveSession(mockUserId, mockSessionId, 3600);

      expect(mockRedisClient.sadd).toHaveBeenCalledWith(
        `user:${mockUserId}`,
        mockSessionId,
        expect.any(Number),
      );
      expect(mockRedisClient.expire).toHaveBeenCalledWith(`user:${mockUserId}`, 3600);
    });
  });

  describe('getSessions', () => {
    it('should retrieve all sessions for a user', async () => {
      const sessionIds = [mockSessionId, 'sess_xyz789'];
      mockRedisClient.smembers.mockResolvedValueOnce(sessionIds);

      const result = await service.getSessions(mockUserId);

      expect(result).toEqual(sessionIds);
      expect(mockRedisClient.smembers).toHaveBeenCalledWith(`user:${mockUserId}`);
    });

    it('should return empty array for user with no sessions', async () => {
      mockRedisClient.smembers.mockResolvedValueOnce([]);

      const result = await service.getSessions(mockUserId);

      expect(result).toEqual([]);
    });
  });

  describe('deleteSession', () => {
    it('should remove session from user set', async () => {
      mockRedisClient.srem.mockResolvedValueOnce(1);

      await service.deleteSession(mockUserId, mockSessionId);

      expect(mockRedisClient.srem).toHaveBeenCalledWith(`user:${mockUserId}`, mockSessionId);
    });
  });
});
