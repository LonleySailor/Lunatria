import { Controller, All, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ServiceAccessGuard } from 'src/auth/guards/service.access.guard';
import { Service } from 'src/auth/decorators/service.decorator';
import { JellyfinService } from './jellyfin.service';
import { EventEmitter } from 'events';

EventEmitter.defaultMaxListeners = 5000;

@Controller('/jellyfin')
export class JellyfinController {
  constructor(private readonly jellyfinService: JellyfinService) { }

  @Service('jellyfin')
  @UseGuards(ServiceAccessGuard)
  @All('*')
  async proxy(@Req() req: any, @Res() res: Response) {
    const userToAuthId = req.session.passport.user;
    if (!req.cookies.jellyfin_auth) {
      const { accessToken, userId, serverId } =
        await this.jellyfinService.getJellyfinToken(userToAuthId);

      res.cookie('jellyfin_auth', 'true', {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 1000 * 60 * 60 * 24,
        domain: '.lunatria.com',
        path: '/',
      });

      // Redirect to the SSO bridge with token
      res.redirect(
        `https://jellyfin.lunatria.com/sso-bridge.html?token=${accessToken}&userId=${userId}&serverId=${serverId}`,
      );
      return;
    }
  }
}
