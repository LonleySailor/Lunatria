import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import axios from 'axios';
import { AuditService } from 'src/audit/audit.service';
import { CredentialsService } from 'src/credentials/credentials.service';
import { REDIS_CLIENT } from 'src/redis/redis.module';

@Injectable()
export class RadarrService {
  private readonly radarrUrl = process.env.RADARR_BASE_URL;
  private readonly redis: Redis;

  constructor(
    private readonly credentialsService: CredentialsService,
    private readonly auditService: AuditService,
    @Inject(REDIS_CLIENT) redis: Redis,
  ) {
    this.redis = redis;
  }

  getBaseUrl(): string {
    if (!this.radarrUrl) {
      throw new Error('RADARR_BASE_URL is not configured');
    }
    return this.radarrUrl;
  }

  async getRadarrCookie(userId: string): Promise<string> {
    const redisKey = `radarr:cookie:${userId}`;
    const cached = await this.redis.get(redisKey);

    if (cached) {
      await this.auditService.log(
        userId,
        'radarr',
        'success',
        'Using cached cookie',
        '/auth',
      );
      return cached;
    }

    const creds = await this.credentialsService.getCredential(userId, 'radarr');

    try {
      const res = await axios.post(
        `${this.getBaseUrl()}/login`,
        new URLSearchParams({
          username: creds.username,
          password: creds.password,
          rememberMe: 'on',
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          maxRedirects: 0,
          validateStatus: (status) => status === 302,
        },
      );

      const cookieHeader = res.headers['set-cookie'];
      const authCookie = cookieHeader?.find((c: string) =>
        c.startsWith('RadarrAuth='),
      );
      if (!authCookie) {
        await this.auditService.log(
          userId,
          'radarr',
          'fail',
          'No RadarrAuth cookie received',
          '/auth',
        );
        throw new Error('No RadarrAuth cookie received from Radarr');
      }

      await this.redis.set(redisKey, authCookie, 'EX', 60 * 60 * 24); // 24 hours
      await this.auditService.log(
        userId,
        'radarr',
        'success',
        'New cookie generated',
        '/auth',
      );

      return authCookie;
    } catch (error) {
      const errorMessage = error.response?.data || error.message;
      await this.auditService.log(
        userId,
        'radarr',
        'fail',
        `Authentication failed: ${errorMessage}`,
        '/auth',
      );
      throw new Error(`Failed to authenticate with Radarr: ${errorMessage}`);
    }
  }
}
