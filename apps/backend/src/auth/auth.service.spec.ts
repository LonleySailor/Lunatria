import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';

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
      jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(true as never);
      mockUsersService.getUser.mockResolvedValueOnce(mockUser);

      const result = await service.validateUser('testuser', 'password');

      expect(result).toEqual({ userId: mockUser.id });
      expect(usersService.getUser).toHaveBeenCalledWith('testuser');
      expect(bcrypt.compare).toHaveBeenCalledWith('password', mockUser.password);
    });

    it('should return null on incorrect password', async () => {
      jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(false as never);
      mockUsersService.getUser.mockResolvedValueOnce(mockUser);

      const result = await service.validateUser('testuser', 'wrongpassword');

      expect(result).toBeNull();
      expect(usersService.getUser).toHaveBeenCalledWith('testuser');
    });

    it('should throw exception when user not found', async () => {
      mockUsersService.getUser.mockResolvedValueOnce(null);

      // The service checks if user exists after getUser but before password validation
      // This test verifies the error handling path
      await expect(service.validateUser('nonexistent', 'password')).rejects.toThrow();
    });
  });
});
