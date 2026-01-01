/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, of, catchError } from 'rxjs';
import { UsersService } from 'src/users/users.service';

type ServiceName =
  | 'hoarder'
  | 'nextcloud'
  | 'vaultwarden'
  | 'jellyfin'
  | 'radarr'
  | 'sonarr'
  | 'komga';

@Injectable()
export class SupportService {
  private readonly logger = new Logger(SupportService.name);

  private readonly services: Record<ServiceName, string> = {
    hoarder: 'https://hoarder.lunatria.com',
    nextcloud: 'https://nextcloud.lunatria.com',
    vaultwarden: 'https://vaultwarden.lunatria.com',
    jellyfin: 'https://jellyfin.lunatria.com',
    radarr: 'https://radarr.lunatria.com',
    sonarr: 'https://sonarr.lunatria.com',
    komga: 'https://komga.lunatria.com',
  };

  constructor(
    private readonly http: HttpService,
    private readonly usersService: UsersService,
  ) {}

  async getServiceStatuses(): Promise<Record<ServiceName, boolean>> {
    const entries = await Promise.all(
      Object.entries(this.services).map(async ([name, url]) => {
        const service = name as ServiceName;

        try {
          const response = await firstValueFrom(
            this.http
              .get(url, {
                timeout: 10000, // 10 seconds timeout
                validateStatus: () => true, // Accept all status codes
              })
              .pipe(
                catchError((err) => {
                  return of(null);
                }),
              ),
          );

          if (!response || response.status !== 200) {
            throw new Error(`Invalid status: ${response?.status ?? 'null'}`);
          }

          const body =
            typeof response.data === 'string'
              ? response.data.toLowerCase()
              : '';

          // Check for 404 Not Found in the body
          if (body.includes('<h1>404 not found</h1>')) {
            throw new Error('Received NGINX 404 content');
          }

          // Check for 502 Bad Gateway in the body
          if (body.includes('<h1>502 bad gateway</h1>')) {
            throw new Error('Received NGINX 502 content');
          }

          return [service, true] as const;
        } catch (err) {
          return [service, false] as const;
        }
      }),
    );

    return Object.fromEntries(entries) as Record<ServiceName, boolean>;
  }

  async checkServiceAccess(req: any, serviceName: string): Promise<boolean> {
    const user = await this.usersService.getUserById(req.session.passport.user);
    return user.allowedServices.includes(serviceName);
  }
}
