import { Inject, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import Redis from 'ioredis';
import { CredentialsService } from 'src/credentials/credentials.service';
import { AuditService } from 'src/audit/audit.service';
import { REDIS_CLIENT } from 'src/redis/redis.module';

@Injectable()
export class JellyfinService {
  private readonly jellyfinUrl = process.env.JELLYFIN_BASE_URL; // your Jellyfin internal IP
  private readonly redis: Redis;

  constructor(
    private readonly http: HttpService,
    private readonly credentialsService: CredentialsService,
    private readonly auditService: AuditService,
    @Inject(REDIS_CLIENT) redis: Redis,
  ) {
    this.redis = redis;
  }

  getBaseUrl(): string {
    if (!this.jellyfinUrl) {
      throw new Error('JELLYFIN_BASE_URL is not configured');
    }
    return this.jellyfinUrl;
  }

  async getJellyfinToken(
    userId: string,
  ): Promise<{ accessToken: string; serverId: string; userId: string }> {
    const redisKey = `jellyfin:token:${userId}`;
    const cached = await this.redis.get(redisKey);
    if (cached) {
      const cachedData = JSON.parse(cached);
      await this.auditService.log(
        userId,
        'jellyfin',
        'success',
        'Using cached token',
        '/auth',
      );
      return cachedData;
    }
    const creds = await this.credentialsService.getCredential(
      userId,
      'jellyfin',
    );
    try {
      const res = await this.http.axiosRef.post(
        `${this.getBaseUrl()}/Users/AuthenticateByName`,
        {
          Username: creds?.username,
          Pw: creds?.password,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Emby-Authorization':
              'MediaBrowser Client="Starlight", Device="Server", DeviceId="unique-id-123", Version="1.0.0"',
          },
        },
      );

      if (
        !res.data?.AccessToken ||
        !res.data?.ServerId ||
        !res.data?.User?.Id
      ) {
        await this.auditService.log(
          userId,
          'jellyfin',
          'fail',
          'No access token, server id or user id received from Jellyfin',
          '/auth',
        );
        throw new Error(
          'No access token, server id or user id received from Jellyfin',
        );
      }

      const token = res.data.AccessToken;
      const serverId = res.data.ServerId;
      const jellyfinUserId = res.data.User.Id;
      const dataToCache = {
        accessToken: token,
        serverId,
        userId: jellyfinUserId,
      };
      await this.redis.set(redisKey, JSON.stringify(dataToCache), 'EX', 86400);
      await this.auditService.log(
        userId,
        'jellyfin',
        'success',
        'New token generated',
        '/auth',
      );
      return dataToCache;
    } catch (error: unknown) {
      const errorMessage =
        (error as {
          response?: { data?: { message?: string } };
          message?: string;
        }).response?.data?.message ||
        (error as { message?: string }).message ||
        'Unknown error';
      await this.auditService.log(
        userId,
        'jellyfin',
        'fail',
        `Authentication failed: ${errorMessage}`,
        '/auth',
      );
      throw new Error(`Failed to authenticate with Jellyfin: ${errorMessage}`);
    }
  }

  /**
   * Create a new Jellyfin user account using the requesting admin's authority.
   * Authenticates as the admin (via their stored Jellyfin credentials) to obtain
   * an access token, creates the user, then sets the provided password.
   */
  async createUser(
    adminUserId: string,
    name: string,
    password: string,
  ): Promise<void> {
    const { accessToken } = await this.getJellyfinToken(adminUserId);
    try {
      const createRes = await this.http.axiosRef.post(
        `${this.getBaseUrl()}/Users/New`,
        { Name: name },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Emby-Token': accessToken,
          },
        },
      );

      const newUserId = createRes.data?.Id;
      if (!newUserId) {
        throw new Error('No user id returned from Jellyfin');
      }

      await this.http.axiosRef.post(
        `${this.getBaseUrl()}/Users/${newUserId}/Password`,
        { CurrentPw: '', NewPw: password },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Emby-Token': accessToken,
          },
        },
      );

      await this.auditService.log(
        adminUserId,
        'jellyfin',
        'success',
        `Created Jellyfin user "${name}"`,
        '/admin/register',
      );
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message;
      await this.auditService.log(
        adminUserId,
        'jellyfin',
        'fail',
        `User creation failed: ${errorMessage}`,
        '/admin/register',
      );
      throw new Error(`Failed to create Jellyfin user: ${errorMessage}`);
    }
  }

  /**
   * Delete a Jellyfin user account using the requesting admin's authority.
   * The true inverse of createUser. Looks the user up by name; if no such
   * account exists it logs and returns (so Lunatria-side cleanup can still
   * proceed), otherwise it deletes the account. Real API errors are rethrown.
   */
  async deleteUser(adminUserId: string, name: string): Promise<void> {
    const { accessToken } = await this.getJellyfinToken(adminUserId);
    try {
      const usersRes = await this.http.axiosRef.get(
        `${this.getBaseUrl()}/Users`,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Emby-Token': accessToken,
          },
        },
      );

      const target = (usersRes.data ?? []).find(
        (u: { Name?: string; Id?: string }) => u.Name === name,
      );

      if (!target?.Id) {
        await this.auditService.log(
          adminUserId,
          'jellyfin',
          'success',
          `Jellyfin user "${name}" not found; nothing to delete`,
          '/admin/revoke',
        );
        return;
      }

      await this.http.axiosRef.delete(
        `${this.getBaseUrl()}/Users/${target.Id}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Emby-Token': accessToken,
          },
        },
      );

      await this.auditService.log(
        adminUserId,
        'jellyfin',
        'success',
        `Deleted Jellyfin user "${name}"`,
        '/admin/revoke',
      );
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message;
      await this.auditService.log(
        adminUserId,
        'jellyfin',
        'fail',
        `User deletion failed: ${errorMessage}`,
        '/admin/revoke',
      );
      throw new Error(`Failed to delete Jellyfin user: ${errorMessage}`);
    }
  }
  async authenticateForApp(
    userId: string,
  ): Promise<any> {
    const creds = await this.credentialsService.getCredential(
      userId,
      'jellyfin',
    );
    if (!creds?.username || !creds?.password) {
      await this.auditService.log(
        userId,
        'jellyfin',
        'fail',
        'No stored Jellyfin credentials found',
        '/app-auth',
      );
      throw new Error('No stored Jellyfin credentials found for this user');
    }

    try {
      const res = await this.http.axiosRef.post(
        `${this.getBaseUrl()}/Users/AuthenticateByName`,
        {
          Username: creds?.username,
          Pw: creds?.password,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Emby-Authorization':
              'MediaBrowser Client="Starlight", Device="Server", DeviceId="unique-id-123", Version="1.0.0"',
          },
        },
      );

      if (
        !res.data?.AccessToken ||
        !res.data?.ServerId ||
        !res.data?.User?.Id
      ) {
        await this.auditService.log(
          userId,
          'jellyfin',
          'fail',
          'No access token, server id or user id received from Jellyfin',
          '/app-auth',
        );
        throw new Error(
          'No access token, server id or user id received from Jellyfin',
        );
      }

      await this.auditService.log(
        userId,
        'jellyfin',
        'success',
        'App authentication successful',
        '/app-auth',
      );
      // Return the full response for the app
      return res.data;
    } catch (error: unknown) {
      const errorMessage =
        (error as {
          response?: { data?: { message?: string } };
          message?: string;
        }).response?.data?.message ||
        (error as { message?: string }).message ||
        'Unknown error';
      await this.auditService.log(
        userId,
        'jellyfin',
        'fail',
        `App authentication failed: ${errorMessage}`,
        '/app-auth',
      );
      throw new Error(
        `Failed to authenticate with Jellyfin: ${errorMessage}`,
      );
    }
  }

  getTargetUrl(originalPath: string): string {
    // Remove the /jellyfin prefix from the path
    const pathWithoutPrefix = originalPath.replace(/^\/jellyfin/, '');
    return `${this.jellyfinUrl}${pathWithoutPrefix}`;
  }
}
