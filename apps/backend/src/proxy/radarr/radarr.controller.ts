import { Controller, All, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { RadarrService } from './radarr.service';
import { Service } from 'src/auth/decorators/service.decorator';
import { ServiceAccessGuard } from 'src/auth/guards/service.access.guard';

@Controller('/radarr')
export class RadarrController {
  constructor(private readonly radarrService: RadarrService) { }

  @Service('radarr')
  @UseGuards(ServiceAccessGuard)
  @All('*')
  async proxy(@Req() req: any, @Res() res: Response) {
    const userId = req.session.passport.user;

    if (!req.cookies.radarr_auth) {
      const radarrCookie = await this.radarrService.getRadarrCookie(userId);

      res.cookie('radarr_auth', 'true', {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 1000 * 60 * 60 * 24,
        domain: '.lunatria.com',
        path: '/',
      });

      // Forward actual RadarrAuth to browser
      const [cookieName, cookieValue] = radarrCookie.split(';')[0].split('=');
      res.cookie(cookieName, cookieValue, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax', // ← match Radarr's default
        path: '/', // ← already correct
        // DO NOT set domain → this makes it HostOnly=true
        maxAge: 1000 * 60 * 60 * 24,
      });

      // Redirect to Radarr domain, now authorized
      return res.redirect('https://radarr.lunatria.com');
    }

    // Optionally you can add fallback logic here
    return res.redirect('https://radarr.lunatria.com');
  }
}
