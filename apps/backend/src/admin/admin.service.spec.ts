import { Test, TestingModule } from '@nestjs/testing';
import { HttpException } from '@nestjs/common';
import { AdminService } from './admin.service';
import { UsersService } from 'src/users/users.service';
import { CredentialsService } from 'src/credentials/credentials.service';
import { JellyfinService } from 'src/proxy/jellyfin/jellyfin.service';
import { ConfigService } from 'src/config/config.service';
import { SERVICES_CONSTANTS } from 'src/config/constants';

describe('AdminService', () => {
  let service: AdminService;
  let usersService: any;
  let credentialsService: any;
  let jellyfinService: any;
  let configService: any;

  const adminUserId = '507f1f77bcf86cd799439000';
  const targetUserId = '507f1f77bcf86cd799439011';

  beforeEach(async () => {
    usersService = {
      getAllUsers: jest.fn(),
      getUserId: jest.fn(),
    };
    credentialsService = {
      getUserIdsWithService: jest.fn(),
      getCredential: jest.fn(),
      setCredential: jest.fn(),
    };
    jellyfinService = {
      createUser: jest.fn(),
    };
    configService = {
      getRadarrServiceCredentials: jest.fn(),
      getSonarrServiceCredentials: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: UsersService, useValue: usersService },
        { provide: CredentialsService, useValue: credentialsService },
        { provide: JellyfinService, useValue: jellyfinService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('getUsersWithoutCredential', () => {
    it('filters out users that already have a credential for the service', async () => {
      usersService.getAllUsers.mockResolvedValueOnce([
        { _id: targetUserId, username: 'alice', email: 'a@x.com' },
        { _id: '507f1f77bcf86cd799439012', username: 'bob', email: 'b@x.com' },
      ]);
      credentialsService.getUserIdsWithService.mockResolvedValueOnce([
        '507f1f77bcf86cd799439012',
      ]);

      const result = await service.getUsersWithoutCredential('jellyfin');

      expect(result).toEqual([
        { id: targetUserId, username: 'alice', email: 'a@x.com' },
      ]);
    });
  });

  describe('registerCredential', () => {
    it('throws when the target user does not exist', async () => {
      usersService.getUserId.mockResolvedValueOnce(null);

      await expect(
        service.registerCredential(
          { service: 'jellyfin', targetUser: 'ghost' },
          adminUserId,
        ),
      ).rejects.toThrow(HttpException);
    });

    it('rejects when a credential already exists', async () => {
      usersService.getUserId.mockResolvedValueOnce(targetUserId);
      credentialsService.getCredential.mockResolvedValueOnce({ username: 'x' });

      await expect(
        service.registerCredential(
          { service: 'jellyfin', targetUser: 'alice' },
          adminUserId,
        ),
      ).rejects.toThrow(HttpException);
    });

    it('stores static Radarr credentials on auto-register', async () => {
      usersService.getUserId.mockResolvedValueOnce(targetUserId);
      credentialsService.getCredential.mockResolvedValueOnce(null);
      configService.getRadarrServiceCredentials.mockReturnValueOnce({
        username: 'radarr_admin',
        password: 'pw',
        apiKey: 'key',
      });

      await service.registerCredential(
        { service: SERVICES_CONSTANTS.SERVICES.RADARR, targetUser: 'alice' },
        adminUserId,
      );

      expect(credentialsService.setCredential).toHaveBeenCalledWith(
        targetUserId,
        SERVICES_CONSTANTS.SERVICES.RADARR,
        { username: 'radarr_admin', password: 'pw', apiKey: 'key' },
      );
    });

    it('fails when static service credentials are not configured', async () => {
      usersService.getUserId.mockResolvedValueOnce(targetUserId);
      credentialsService.getCredential.mockResolvedValueOnce(null);
      configService.getSonarrServiceCredentials.mockReturnValueOnce({
        username: '',
        password: '',
        apiKey: '',
      });

      await expect(
        service.registerCredential(
          { service: SERVICES_CONSTANTS.SERVICES.SONARR, targetUser: 'alice' },
          adminUserId,
        ),
      ).rejects.toThrow(HttpException);
      expect(credentialsService.setCredential).not.toHaveBeenCalled();
    });

    it('creates a Jellyfin user with a 16-char password and stores it', async () => {
      usersService.getUserId.mockResolvedValueOnce(targetUserId);
      credentialsService.getCredential.mockResolvedValueOnce(null);
      jellyfinService.createUser.mockResolvedValueOnce(undefined);

      await service.registerCredential(
        { service: SERVICES_CONSTANTS.SERVICES.JELLYFIN, targetUser: 'alice' },
        adminUserId,
      );

      expect(jellyfinService.createUser).toHaveBeenCalledTimes(1);
      const [calledAdminId, calledName, calledPassword] =
        jellyfinService.createUser.mock.calls[0];
      expect(calledAdminId).toBe(adminUserId);
      expect(calledName).toBe('alice');
      expect(calledPassword).toHaveLength(16);

      expect(credentialsService.setCredential).toHaveBeenCalledWith(
        targetUserId,
        SERVICES_CONSTANTS.SERVICES.JELLYFIN,
        { username: 'alice', password: calledPassword },
      );
    });

    it('surfaces a Jellyfin creation failure and does not store credentials', async () => {
      usersService.getUserId.mockResolvedValueOnce(targetUserId);
      credentialsService.getCredential.mockResolvedValueOnce(null);
      jellyfinService.createUser.mockRejectedValueOnce(new Error('boom'));

      await expect(
        service.registerCredential(
          {
            service: SERVICES_CONSTANTS.SERVICES.JELLYFIN,
            targetUser: 'alice',
          },
          adminUserId,
        ),
      ).rejects.toThrow(HttpException);
      expect(credentialsService.setCredential).not.toHaveBeenCalled();
    });

    it('stores admin-entered credentials when auto-register is off', async () => {
      usersService.getUserId.mockResolvedValueOnce(targetUserId);
      credentialsService.getCredential.mockResolvedValueOnce(null);

      await service.registerCredential(
        {
          service: SERVICES_CONSTANTS.SERVICES.JELLYFIN,
          targetUser: 'alice',
          autoRegister: false,
          username: 'manualuser',
          password: 'manualpw',
          email: 'm@x.com',
        },
        adminUserId,
      );

      expect(jellyfinService.createUser).not.toHaveBeenCalled();
      expect(credentialsService.setCredential).toHaveBeenCalledWith(
        targetUserId,
        SERVICES_CONSTANTS.SERVICES.JELLYFIN,
        { username: 'manualuser', password: 'manualpw', email: 'm@x.com' },
      );
    });
  });
});
