import { Controller, All, Req, Res, UseGuards, Post, Body } from '@nestjs/common';
import { Response } from 'express';
import { ServiceAccessGuard } from 'src/auth/guards/service.access.guard';
import { Service } from 'src/auth/decorators/service.decorator';
import { JellyfinService } from './jellyfin.service';
import { SERVICES_CONSTANTS } from 'src/config/constants';
import { ConfigService } from 'src/config/config.service';
import { AuthService } from 'src/auth/auth.service';
import { throwException } from 'src/responseStatus/auth.response';

@Controller(SERVICES_CONSTANTS.JELLYFIN.ROUTE)
export class JellyfinController {
  constructor(
    private readonly jellyfinService: JellyfinService,
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {}

  @Post(SERVICES_CONSTANTS.JELLYFIN.ENDPOINT_APP_AUTH)
  async appAuth(
    @Body() body: { Username: string; Pw: string },
    @Res() res: Response,
  ) {
    // Validate Lunatria credentials (throws if user not found or invalid)
    const validatedUser = await this.authService.validateUser(
      body.Username,
      body.Pw,
    );
    if (!validatedUser) {
      throwException.IncorrectPassword();
    }

    // Get full Jellyfin auth response using user's stored credentials
    // This returns the complete Jellyfin auth response (User, SessionInfo, AccessToken, etc.)
    const jellyfinAuthResponse =
      await this.jellyfinService.authenticateForApp(validatedUser.userId);
    // Return the response directly to the app
    res.json(jellyfinAuthResponse);
  }

  @Service(SERVICES_CONSTANTS.SERVICES.JELLYFIN)
  @UseGuards(ServiceAccessGuard)
  @All('*')
  async proxy(@Req() req: any, @Res() res: Response) {
    const userToAuthId = req.session.passport.user;
    const domainName = this.configService.getDomainName();
    const cookieMaxAge = this.configService.getServiceCookieMaxAge();
    const jellyfinPublicUrl = this.configService.getJellyfinPublicUrl();

    if (!req.cookies[SERVICES_CONSTANTS.COOKIES.JELLYFIN]) {
      const { accessToken, userId, serverId } =
        await this.jellyfinService.getJellyfinToken(userToAuthId);

      res.cookie(SERVICES_CONSTANTS.COOKIES.JELLYFIN, 'true', {
        httpOnly: SERVICES_CONSTANTS.COOKIES.HTTP_ONLY,
        secure: SERVICES_CONSTANTS.COOKIES.SECURE,
        sameSite: SERVICES_CONSTANTS.COOKIES.SAME_SITE_NONE,
        maxAge: cookieMaxAge,
        domain: `.${domainName}`,
        path: SERVICES_CONSTANTS.COOKIES.PATH,
      });

      // Redirect to the SSO bridge with token
      res.redirect(
        `${jellyfinPublicUrl}/sso-bridge.html?token=${accessToken}&userId=${userId}&serverId=${serverId}`,
      );
      return;
    }
  }
}
