import { Controller, All, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { RadarrService } from './radarr.service';
import { Service } from 'src/auth/decorators/service.decorator';
import { ServiceAccessGuard } from 'src/auth/guards/service.access.guard';
import { SERVICES_CONSTANTS } from 'src/config/constants';
import { ConfigService } from 'src/config/config.service';

@Controller(SERVICES_CONSTANTS.RADARR.ROUTE)
export class RadarrController {
  constructor(
    private readonly radarrService: RadarrService,
    private readonly configService: ConfigService,
  ) {}

  @Service(SERVICES_CONSTANTS.SERVICES.RADARR)
  @UseGuards(ServiceAccessGuard)
  @All('*')
  async proxy(@Req() req: any, @Res() res: Response) {
    const userId = req.session.passport.user;
    const domainName = this.configService.getDomainName();
    const cookieMaxAge = this.configService.getServiceCookieMaxAge();
    const radarrPublicUrl = this.configService.getRadarrPublicUrl();

    if (!req.cookies[SERVICES_CONSTANTS.COOKIES.RADARR]) {
      const radarrCookie = await this.radarrService.getRadarrCookie(userId);

      res.cookie(SERVICES_CONSTANTS.COOKIES.RADARR, 'true', {
        httpOnly: SERVICES_CONSTANTS.COOKIES.HTTP_ONLY,
        secure: SERVICES_CONSTANTS.COOKIES.SECURE,
        sameSite: SERVICES_CONSTANTS.COOKIES.SAME_SITE_NONE,
        maxAge: cookieMaxAge,
        domain: `.${domainName}`,
        path: SERVICES_CONSTANTS.COOKIES.PATH,
      });

      // Forward actual RadarrAuth to browser
      const [cookieName, cookieValue] = radarrCookie.split(';')[0].split('=');
      res.cookie(cookieName, cookieValue, {
        httpOnly: SERVICES_CONSTANTS.COOKIES.HTTP_ONLY,
        secure: SERVICES_CONSTANTS.COOKIES.SECURE,
        sameSite: SERVICES_CONSTANTS.COOKIES.SAME_SITE_LAX,
        path: SERVICES_CONSTANTS.COOKIES.PATH,
        maxAge: cookieMaxAge,
      });

      // Redirect to Radarr domain, now authorized
      return res.redirect(radarrPublicUrl);
    }

    return res.redirect(radarrPublicUrl);
  }
}
