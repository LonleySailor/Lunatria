import { Test, TestingModule } from '@nestjs/testing';
import { HttpException } from '@nestjs/common';
import { AdminService } from './admin.service';
import { UsersService } from 'src/users/users.service';
import { CredentialsService } from 'src/credentials/credentials.service';
import { JellyfinService } from 'src/proxy/jellyfin/jellyfin.service';
import { ConfigService } from 'src/config/config.service';
import { SERVICES_CONSTANTS } from 'src/config/constants';
import { REDIS_CLIENT } from 'src/redis/redis.module';
import { SessionsService } from 'src/sessions/sessions.service';

describe('AdminService', () => {
  let service: AdminService;
  let usersService: any;
  let credentialsService: any;
  let jellyfinService: any;
  let configService: any;
  let redis: any;
  let sessionsService: any;

  const adminUserId = '507f1f77bcf86cd799439000';
  const targetUserId = '507f1f77bcf86cd799439011';

  beforeEach(async () => {
    usersService = {
      getAllUsers: jest.fn(),
      getUserId: jest.fn(),
      getUser: jest.fn(),
      addAllowedService: jest.fn(),
      removeAllowedService: jest.fn(),
      deleteUser: jest.fn(),
    };
    credentialsService = {
      getUserIdsWithService: jest.fn(),
      getCredential: jest.fn(),
      setCredential: jest.fn(),
      deleteCredential: jest.fn(),
      getServicesForUser: jest.fn(),
    };
    jellyfinService = {
      createUser: jest.fn(),
      deleteUser: jest.fn(),
    };
    configService = {
      getRadarrServiceCredentials: jest.fn(),
      getSonarrServiceCredentials: jest.fn(),
    };
    redis = {
      del: jest.fn(),
    };
    sessionsService = {
      deleteAllSessions: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: UsersService, useValue: usersService },
        { provide: CredentialsService, useValue: credentialsService },
        { provide: JellyfinService, useValue: jellyfinService },
        { provide: ConfigService, useValue: configService },
        { provide: REDIS_CLIENT, useValue: redis },
        { provide: SessionsService, useValue: sessionsService },
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

  describe('getUsersWithCredential', () => {
    it('lists only users that have a credential for the service', async () => {
      usersService.getAllUsers.mockResolvedValueOnce([
        { _id: targetUserId, username: 'alice', email: 'a@x.com' },
        { _id: '507f1f77bcf86cd799439012', username: 'bob', email: 'b@x.com' },
      ]);
      credentialsService.getUserIdsWithService.mockResolvedValueOnce([
        targetUserId,
      ]);

      const result = await service.getUsersWithCredential('jellyfin');

      expect(result).toEqual([
        { id: targetUserId, username: 'alice', email: 'a@x.com' },
      ]);
    });
  });

  describe('revokeCredential', () => {
    it('throws when the target user does not exist', async () => {
      usersService.getUserId.mockResolvedValueOnce(null);

      await expect(
        service.revokeCredential(
          { service: 'jellyfin', targetUser: 'ghost' },
          adminUserId,
        ),
      ).rejects.toThrow(HttpException);
      expect(credentialsService.deleteCredential).not.toHaveBeenCalled();
    });

    it('throws when the user has no credential for the service', async () => {
      usersService.getUserId.mockResolvedValueOnce(targetUserId);
      credentialsService.getCredential.mockResolvedValueOnce(null);

      await expect(
        service.revokeCredential(
          { service: 'jellyfin', targetUser: 'alice' },
          adminUserId,
        ),
      ).rejects.toThrow(HttpException);
      expect(credentialsService.deleteCredential).not.toHaveBeenCalled();
    });

    it('deletes the Jellyfin account, credential and cached token', async () => {
      usersService.getUserId.mockResolvedValueOnce(targetUserId);
      credentialsService.getCredential.mockResolvedValueOnce({
        username: 'alice',
        password: 'pw',
      });
      jellyfinService.deleteUser.mockResolvedValueOnce(undefined);

      const result = await service.revokeCredential(
        { service: SERVICES_CONSTANTS.SERVICES.JELLYFIN, targetUser: 'alice' },
        adminUserId,
      );

      expect(jellyfinService.deleteUser).toHaveBeenCalledWith(
        adminUserId,
        'alice',
      );
      expect(credentialsService.deleteCredential).toHaveBeenCalledWith(
        targetUserId,
        SERVICES_CONSTANTS.SERVICES.JELLYFIN,
      );
      expect(redis.del).toHaveBeenCalledWith(
        `${SERVICES_CONSTANTS.SERVICES.JELLYFIN}:token:${targetUserId}`,
      );
      expect(redis.del).toHaveBeenCalledWith(
        `${SERVICES_CONSTANTS.SERVICES.JELLYFIN}:cookie:${targetUserId}`,
      );
      expect(result).toEqual({
        success: true,
        service: SERVICES_CONSTANTS.SERVICES.JELLYFIN,
        targetUser: 'alice',
      });
    });

    it('surfaces a Jellyfin deletion failure and does not delete the credential', async () => {
      usersService.getUserId.mockResolvedValueOnce(targetUserId);
      credentialsService.getCredential.mockResolvedValueOnce({
        username: 'alice',
      });
      jellyfinService.deleteUser.mockRejectedValueOnce(new Error('boom'));

      await expect(
        service.revokeCredential(
          { service: SERVICES_CONSTANTS.SERVICES.JELLYFIN, targetUser: 'alice' },
          adminUserId,
        ),
      ).rejects.toThrow(HttpException);
      expect(credentialsService.deleteCredential).not.toHaveBeenCalled();
    });

    it('revokes a static service without touching Jellyfin', async () => {
      usersService.getUserId.mockResolvedValueOnce(targetUserId);
      credentialsService.getCredential.mockResolvedValueOnce({
        username: 'radarr_admin',
      });

      await service.revokeCredential(
        { service: SERVICES_CONSTANTS.SERVICES.RADARR, targetUser: 'alice' },
        adminUserId,
      );

      expect(jellyfinService.deleteUser).not.toHaveBeenCalled();
      expect(credentialsService.deleteCredential).toHaveBeenCalledWith(
        targetUserId,
        SERVICES_CONSTANTS.SERVICES.RADARR,
      );
      expect(redis.del).toHaveBeenCalledWith(
        `${SERVICES_CONSTANTS.SERVICES.RADARR}:token:${targetUserId}`,
      );
      expect(redis.del).toHaveBeenCalledWith(
        `${SERVICES_CONSTANTS.SERVICES.RADARR}:cookie:${targetUserId}`,
      );
    });
  });

  describe('getUsersWithoutAccess', () => {
    it('lists users lacking access, with role and credential flags', async () => {
      usersService.getAllUsers.mockResolvedValueOnce([
        {
          _id: targetUserId,
          username: 'alice',
          email: 'a@x.com',
          userType: 'user',
          allowedServices: [],
        },
        {
          _id: '507f1f77bcf86cd799439012',
          username: 'bob',
          email: 'b@x.com',
          userType: 'admin',
          allowedServices: ['jellyfin'],
        },
        {
          _id: '507f1f77bcf86cd799439013',
          username: 'carol',
          email: 'c@x.com',
          userType: 'user',
          allowedServices: [],
        },
      ]);
      // carol already has stored credentials for jellyfin
      credentialsService.getUserIdsWithService.mockResolvedValueOnce([
        '507f1f77bcf86cd799439013',
      ]);

      const result = await service.getUsersWithoutAccess('jellyfin');

      // bob is filtered out (already has access); alice + carol remain
      expect(result).toEqual([
        {
          id: targetUserId,
          username: 'alice',
          email: 'a@x.com',
          userType: 'user',
          hasCredentials: false,
        },
        {
          id: '507f1f77bcf86cd799439013',
          username: 'carol',
          email: 'c@x.com',
          userType: 'user',
          hasCredentials: true,
        },
      ]);
    });
  });

  describe('grantAccess', () => {
    it('throws when the target user does not exist', async () => {
      usersService.getUser.mockResolvedValueOnce(null);

      await expect(
        service.grantAccess({ service: 'jellyfin', targetUser: 'ghost' }),
      ).rejects.toThrow(HttpException);
      expect(usersService.addAllowedService).not.toHaveBeenCalled();
    });

    it('rejects when the user already has access', async () => {
      usersService.getUser.mockResolvedValueOnce({
        _id: targetUserId,
        allowedServices: ['jellyfin'],
      });

      await expect(
        service.grantAccess({ service: 'jellyfin', targetUser: 'alice' }),
      ).rejects.toThrow(HttpException);
      expect(usersService.addAllowedService).not.toHaveBeenCalled();
    });

    it('adds the service to allowedServices on success', async () => {
      usersService.getUser.mockResolvedValueOnce({
        _id: targetUserId,
        allowedServices: [],
      });

      const result = await service.grantAccess({
        service: 'jellyfin',
        targetUser: 'alice',
      });

      expect(usersService.addAllowedService).toHaveBeenCalledWith(
        targetUserId,
        'jellyfin',
      );
      expect(result).toEqual({
        success: true,
        service: 'jellyfin',
        targetUser: 'alice',
      });
    });
  });

  describe('getUsersWithAccess', () => {
    it('lists only users whose allowedServices includes the service', async () => {
      usersService.getAllUsers.mockResolvedValueOnce([
        {
          _id: targetUserId,
          username: 'alice',
          email: 'a@x.com',
          userType: 'user',
          allowedServices: ['jellyfin'],
        },
        {
          _id: '507f1f77bcf86cd799439012',
          username: 'bob',
          email: 'b@x.com',
          userType: 'admin',
          allowedServices: [],
        },
        {
          _id: '507f1f77bcf86cd799439013',
          username: 'carol',
          email: 'c@x.com',
          userType: 'admin',
          allowedServices: ['jellyfin'],
        },
      ]);
      // alice has stored credentials for jellyfin
      credentialsService.getUserIdsWithService.mockResolvedValueOnce([
        targetUserId,
      ]);

      const result = await service.getUsersWithAccess('jellyfin');

      // bob is filtered out (no access); alice + carol remain
      expect(result).toEqual([
        {
          id: targetUserId,
          username: 'alice',
          email: 'a@x.com',
          userType: 'user',
          hasCredentials: true,
        },
        {
          id: '507f1f77bcf86cd799439013',
          username: 'carol',
          email: 'c@x.com',
          userType: 'admin',
          hasCredentials: false,
        },
      ]);
    });
  });

  describe('revokeAccess', () => {
    it('throws when the target user does not exist', async () => {
      usersService.getUser.mockResolvedValueOnce(null);

      await expect(
        service.revokeAccess({ service: 'jellyfin', targetUser: 'ghost' }),
      ).rejects.toThrow(HttpException);
      expect(usersService.removeAllowedService).not.toHaveBeenCalled();
    });

    it('rejects when the user does not have access', async () => {
      usersService.getUser.mockResolvedValueOnce({
        _id: targetUserId,
        allowedServices: [],
      });

      await expect(
        service.revokeAccess({ service: 'jellyfin', targetUser: 'alice' }),
      ).rejects.toThrow(HttpException);
      expect(usersService.removeAllowedService).not.toHaveBeenCalled();
    });

    it('removes the service from allowedServices on success', async () => {
      usersService.getUser.mockResolvedValueOnce({
        _id: targetUserId,
        allowedServices: ['jellyfin'],
      });

      const result = await service.revokeAccess({
        service: 'jellyfin',
        targetUser: 'alice',
      });

      expect(usersService.removeAllowedService).toHaveBeenCalledWith(
        targetUserId,
        'jellyfin',
      );
      expect(result).toEqual({
        success: true,
        service: 'jellyfin',
        targetUser: 'alice',
      });
    });
  });

  describe('getUsers', () => {
    it('returns all users except the requesting admin', async () => {
      usersService.getAllUsers.mockResolvedValueOnce([
        {
          _id: adminUserId,
          username: 'root',
          email: 'r@x.com',
          userType: 'admin',
        },
        {
          _id: targetUserId,
          username: 'alice',
          email: 'a@x.com',
          userType: 'user',
        },
      ]);

      const result = await service.getUsers(adminUserId);

      expect(result).toEqual([
        {
          id: targetUserId,
          username: 'alice',
          email: 'a@x.com',
          userType: 'user',
        },
      ]);
    });
  });

  describe('deleteUser', () => {
    it('throws when the target user does not exist', async () => {
      usersService.getUser.mockResolvedValueOnce(null);

      await expect(
        service.deleteUser('ghost', adminUserId),
      ).rejects.toThrow(HttpException);
      expect(usersService.deleteUser).not.toHaveBeenCalled();
    });

    it('refuses to delete the requesting admin', async () => {
      usersService.getUser.mockResolvedValueOnce({ _id: adminUserId });

      await expect(
        service.deleteUser('root', adminUserId),
      ).rejects.toThrow(HttpException);
      expect(usersService.deleteUser).not.toHaveBeenCalled();
    });

    it('tears down credentials, accounts, sessions and the user record', async () => {
      const userDoc = { _id: targetUserId, username: 'alice' };
      usersService.getUser.mockResolvedValueOnce(userDoc);
      credentialsService.getServicesForUser.mockResolvedValueOnce([
        SERVICES_CONSTANTS.SERVICES.JELLYFIN,
        SERVICES_CONSTANTS.SERVICES.RADARR,
      ]);
      credentialsService.getCredential
        .mockResolvedValueOnce({ username: 'alice' }) // jellyfin cleanup
        .mockResolvedValueOnce({ username: 'radarr_admin' }); // radarr cleanup
      jellyfinService.deleteUser.mockResolvedValueOnce(undefined);

      const result = await service.deleteUser('alice', adminUserId);

      expect(jellyfinService.deleteUser).toHaveBeenCalledWith(
        adminUserId,
        'alice',
      );
      expect(jellyfinService.deleteUser).toHaveBeenCalledTimes(1);
      expect(credentialsService.deleteCredential).toHaveBeenCalledWith(
        targetUserId,
        SERVICES_CONSTANTS.SERVICES.JELLYFIN,
      );
      expect(credentialsService.deleteCredential).toHaveBeenCalledWith(
        targetUserId,
        SERVICES_CONSTANTS.SERVICES.RADARR,
      );
      expect(sessionsService.deleteAllSessions).toHaveBeenCalledWith(
        targetUserId,
      );
      expect(usersService.deleteUser).toHaveBeenCalledWith(userDoc);
      expect(result).toEqual({ success: true, targetUser: 'alice' });
    });

    it('aborts (keeps the user) when a Jellyfin account deletion fails', async () => {
      usersService.getUser.mockResolvedValueOnce({
        _id: targetUserId,
        username: 'alice',
      });
      credentialsService.getServicesForUser.mockResolvedValueOnce([
        SERVICES_CONSTANTS.SERVICES.JELLYFIN,
      ]);
      credentialsService.getCredential.mockResolvedValueOnce({
        username: 'alice',
      });
      jellyfinService.deleteUser.mockRejectedValueOnce(new Error('boom'));

      await expect(
        service.deleteUser('alice', adminUserId),
      ).rejects.toThrow(HttpException);
      expect(usersService.deleteUser).not.toHaveBeenCalled();
      expect(sessionsService.deleteAllSessions).not.toHaveBeenCalled();
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
