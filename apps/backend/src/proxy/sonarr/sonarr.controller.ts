import { Controller, All, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { SonarrService } from './sonarr.service';
import { Service } from 'src/auth/decorators/service.decorator';
import { ServiceAccessGuard } from 'src/auth/guards/service.access.guard';
import { SERVICES_CONSTANTS } from 'src/config/constants';
import { ConfigService } from 'src/config/config.service';

@Controller(SERVICES_CONSTANTS.SONARR.ROUTE)
export class SonarrController {
  constructor(
    private readonly sonarrService: SonarrService,
    private readonly configService: ConfigService,
  ) {}

  @Service(SERVICES_CONSTANTS.SERVICES.SONARR)
  @UseGuards(ServiceAccessGuard)
  @All('*')
  async proxy(@Req() req: any, @Res() res: Response) {
    const userId = req.session.passport.user;
    const domainName = this.configService.getDomainName();
    const cookieMaxAge = this.configService.getServiceCookieMaxAge();
    const sonarrPublicUrl = this.configService.getSonarrPublicUrl();

    if (!req.cookies[SERVICES_CONSTANTS.COOKIES.SONARR]) {
      const sonarrCookie = await this.sonarrService.getSonarrCookie(userId);

      res.cookie(SERVICES_CONSTANTS.COOKIES.SONARR, 'true', {
        httpOnly: SERVICES_CONSTANTS.COOKIES.HTTP_ONLY,
        secure: SERVICES_CONSTANTS.COOKIES.SECURE,
        sameSite: SERVICES_CONSTANTS.COOKIES.SAME_SITE_NONE,
        maxAge: cookieMaxAge,
        domain: `.${domainName}`,
        path: SERVICES_CONSTANTS.COOKIES.PATH,
      });

      // Forward actual SonarrAuth to browser
      const [cookieName, cookieValue] = sonarrCookie.split(';')[0].split('=');
      res.cookie(cookieName, cookieValue, {
        httpOnly: SERVICES_CONSTANTS.COOKIES.HTTP_ONLY,
        secure: SERVICES_CONSTANTS.COOKIES.SECURE,
        sameSite: SERVICES_CONSTANTS.COOKIES.SAME_SITE_LAX,
        path: SERVICES_CONSTANTS.COOKIES.PATH,
        maxAge: cookieMaxAge,
      });

      // Redirect to Sonarr domain, now authorized
      return res.redirect(sonarrPublicUrl);
    }

    return res.redirect(sonarrPublicUrl);
  }
}
