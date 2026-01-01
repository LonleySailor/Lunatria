import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import Redis from 'ioredis';
import { CredentialsService } from 'src/credentials/credentials.service';
import { AuditService } from 'src/audit/audit.service';

@Injectable()
export class JellyfinService {
  private readonly jellyfinUrl = process.env.JELLYFIN_BASE_URL; // your Jellyfin internal IP
  private readonly redis: Redis;

  constructor(
    private readonly http: HttpService,
    private readonly credentialsService: CredentialsService,
    private readonly auditService: AuditService,
  ) {
    this.redis = new Redis(process.env.REDIS_URL);
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
      console.log(
        `Attempting to authenticate with Jellyfin at ${this.jellyfinUrl}`,
      );
      const res = await this.http.axiosRef.post(
        `${this.jellyfinUrl}/Users/AuthenticateByName`,
        {
          Username: creds.username,
          Pw: creds.password,
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
      await this.redis.set(redisKey, JSON.stringify(dataToCache));
      await this.auditService.log(
        userId,
        'jellyfin',
        'success',
        'New token generated',
        '/auth',
      );
      return dataToCache;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
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

  getTargetUrl(originalPath: string): string {
    // Remove the /jellyfin prefix from the path
    const pathWithoutPrefix = originalPath.replace(/^\/jellyfin/, '');
    return `${this.jellyfinUrl}${pathWithoutPrefix}`;
  }
}
