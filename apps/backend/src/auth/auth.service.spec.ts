import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  hashSync: jest.fn(() => '$2b$10$dummydummydummydummydummydummydummydummydu'),
  compare: jest.fn(),
}));

const mockCompare = bcrypt.compare as jest.Mock;

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;

  const mockUser = {
    id: '507f1f77bcf86cd799439011',
    username: 'testuser',
    password: '$2b$10$hashedpassword', // bcrypt hash
    email: 'test@example.com',
    userType: 'user',
    allowedServices: ['jellyfin'],
  };

  const mockUsersService = {
    getUser: jest.fn(),
    getUserById: jest.fn(),
    insertUser: jest.fn(),
    deleteUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should return userId on successful validation', async () => {
      mockCompare.mockResolvedValueOnce(true);
      mockUsersService.getUser.mockResolvedValueOnce(mockUser);

      const result = await service.validateUser('testuser', 'password');

      expect(result).toEqual({ userId: mockUser.id });
      expect(usersService.getUser).toHaveBeenCalledWith('testuser');
      expect(mockCompare).toHaveBeenCalledWith('password', mockUser.password);
    });

    it('should return null on incorrect password', async () => {
      mockCompare.mockResolvedValueOnce(false);
      mockUsersService.getUser.mockResolvedValueOnce(mockUser);

      const result = await service.validateUser('testuser', 'wrongpassword');

      expect(result).toBeNull();
      expect(usersService.getUser).toHaveBeenCalledWith('testuser');
    });

    it('should return null when user not found (no enumeration)', async () => {
      mockCompare.mockResolvedValueOnce(false);
      mockUsersService.getUser.mockResolvedValueOnce(null);

      // Missing user and wrong password must be indistinguishable: both return
      // null so callers surface a single generic InvalidCredentials error.
      const result = await service.validateUser('nonexistent', 'password');

      expect(result).toBeNull();
      // A bcrypt.compare still runs (against a dummy hash) so response timing
      // does not reveal whether the account exists.
      expect(mockCompare).toHaveBeenCalled();
    });
  });
});
