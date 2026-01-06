/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, of, catchError } from 'rxjs';
import { UsersService } from 'src/users/users.service';
import { ConfigService } from 'src/config/config.service';
import { SERVICES_CONSTANTS } from 'src/config/constants';

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

  constructor(
    private readonly http: HttpService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  private buildServices(): Record<ServiceName, string> {
    return {
      hoarder: this.configService.getServicePublicUrl(SERVICES_CONSTANTS.SERVICES.HOARDER),
      nextcloud: this.configService.getServicePublicUrl(SERVICES_CONSTANTS.SERVICES.NEXTCLOUD),
      vaultwarden: this.configService.getServicePublicUrl(SERVICES_CONSTANTS.SERVICES.VAULTWARDEN),
      jellyfin: this.configService.getServicePublicUrl(SERVICES_CONSTANTS.SERVICES.JELLYFIN),
      radarr: this.configService.getServicePublicUrl(SERVICES_CONSTANTS.SERVICES.RADARR),
      sonarr: this.configService.getServicePublicUrl(SERVICES_CONSTANTS.SERVICES.SONARR),
      komga: this.configService.getServicePublicUrl(SERVICES_CONSTANTS.SERVICES.KOMGA),
    };
  }

  async getServiceStatuses(): Promise<Record<ServiceName, boolean>> {
    const services = this.buildServices();
    const entries = await Promise.all(
      Object.entries(services).map(async ([name, url]) => {
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
