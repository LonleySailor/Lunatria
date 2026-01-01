import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import axios from 'axios';
import { AuditService } from 'src/audit/audit.service';
import { CredentialsService } from 'src/credentials/credentials.service';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class RadarrService {
  private readonly radarrUrl = process.env.RADARR_BASE_URL;
  private readonly redis: Redis;

  constructor(
    private readonly http: HttpService,
    private readonly credentialsService: CredentialsService,
    private readonly auditService: AuditService,
  ) {
    this.redis = new Redis(process.env.REDIS_URL);
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
        `${this.radarrUrl}/login`,
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
