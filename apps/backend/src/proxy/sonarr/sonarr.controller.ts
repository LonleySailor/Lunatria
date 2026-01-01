import { Controller, All, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { SonarrService } from './sonarr.service';
import { Service } from 'src/auth/decorators/service.decorator';
import { ServiceAccessGuard } from 'src/auth/guards/service.access.guard';

@Controller('/sonarr')
export class SonarrController {
  constructor(private readonly sonarrService: SonarrService) { }

  @Service('sonarr')
  @UseGuards(ServiceAccessGuard)
  @All('*')
  async proxy(@Req() req: any, @Res() res: Response) {
    const userId = req.session.passport.user;

    if (!req.cookies.sonarr_auth) {
      const sonarrCookie = await this.sonarrService.getSonarrCookie(userId);

      res.cookie('sonarr_auth', 'true', {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 1000 * 60 * 60 * 24,
        domain: '.lunatria.com',
        path: '/',
      });

      // Forward actual sonarrAuth to browser
      const [cookieName, cookieValue] = sonarrCookie.split(';')[0].split('=');
      res.cookie(cookieName, cookieValue, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax', // ← match sonarr's default
        path: '/', // ← already correct
        // DO NOT set domain → this makes it HostOnly=true
        maxAge: 1000 * 60 * 60 * 24,
      });

      // Redirect to sonarr domain, now authorized
      return res.redirect('https://sonarr.lunatria.com');
    }

    // Optionally you can add fallback logic here
    return res.redirect('https://sonarr.lunatria.com');
  }
}
