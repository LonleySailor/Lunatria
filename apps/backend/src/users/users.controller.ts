import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
  Delete,
  Res,
  Req,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { throwException } from 'src/responseStatus/auth.response';
import { throwSessionException } from 'src/responseStatus/sessions.response';
import { SessionsService } from 'src/sessions/sessions.service';
import { AuthenticatedGuard } from 'src/auth/guards/authenticated.guard';
import { LocalAuthGuard } from 'src/auth/guards/local.auth.guard';
import { Response } from 'express';
import { AdminGuard } from 'src/auth/guards/admin.guard';
import Redis from 'ioredis';
import { ConfigService } from 'src/config/config.service';
import { APP_CONSTANTS, AUTH_CONSTANTS, SERVICES_CONSTANTS } from 'src/config/constants';
import { Inject } from '@nestjs/common';
import { REDIS_CLIENT } from 'src/redis/redis.module';

@Controller(AUTH_CONSTANTS.CONTROLLERS.USERS)
export class UsersController {
  private readonly redis: Redis;

  constructor(
    private readonly usersService: UsersService,
    private readonly sessionService: SessionsService,
    @Inject(REDIS_CLIENT) redis: Redis,
    private readonly configService: ConfigService,
  ) {
    this.redis = redis;
  }
  @UseGuards(AdminGuard)
  @Post(AUTH_CONSTANTS.ENDPOINTS.REGISTER)
  async addUser(
    @Body('password') userPassword: string,
    @Body('username') userName: string,
    @Body('email') email: string,
    @Body('usertype') userType: string,
    @Body('allowedServices') allowedServices: [],
  ) {
    if (await this.usersService.checkUniqueness('username', userName)) {
      throwException.UsernameAlreadyUsed();
    }
    const hashedPassword = await bcrypt.hash(userPassword, AUTH_CONSTANTS.BCRYPT_ROUNDS);
    const result = await this.usersService.insertUser(
      userName,
      hashedPassword,
      email,
      userType,
      allowedServices,
    );
    const user = {
      userName: result.username,
    };
    return user;
  }

  @UseGuards(LocalAuthGuard)
  @Post(AUTH_CONSTANTS.ENDPOINTS.LOGIN)
  async login(
    @Request() req,
    @Body('username') username: string,
  ): Promise<any> {
    const user = await this.usersService.getUser(username);
    const userId = req.session.passport.user; // Passport sets this after login
    const sessionId = req.session.id; // Get the session ID from Express session

    if (userId && sessionId) {
      await this.sessionService.saveSession(userId, sessionId); // Save session to Redis
    }

    const data = {
      User: user.username,
    };
    throwException.UserloggedIn(data);
  }

  @Get(AUTH_CONSTANTS.ENDPOINTS.LOGOUT)
  async logout(@Req() req: any, @Res() res: Response): Promise<any> {
    return new Promise((resolve, reject) => {
      req.session.destroy((err) => {
        if (err) {
          reject(err);
        } else {this.configService.getDomainName();
          const domain = this.configService.getDomainName();
          res
            .clearCookie(APP_CONSTANTS.SESSION_NAME, {
              domain: domain,
              path: '/',
            })
            .status(200)
            .json({ message: 'Logged out' });
          resolve(null);
        }
      });
    });
  }

  @Get(AUTH_CONSTANTS.ENDPOINTS.LOGOUT_JELLYFIN)
  async logoutJellyfin(@Req() req: any, @Res() res: Response): Promise<any> {
    const userId = req.session.passport.user;
    const redisKey = `jellyfin:token:${userId}`;
    await this.redis.del(redisKey);
    const redisRadarrKey = `radarr:cookie:${userId}`;
    await this.redis.del(redisRadarrKey);
    return new Promise((resolve, reject) => {
      req.session.destroy((err) => {
        if (err) {
          reject(err);
        } else {
          const domain = this.configService.getDomainName();
          res
            .clearCookie(SERVICES_CONSTANTS.COOKIES.JELLYFIN, {
              domain: domain,
              path: SERVICES_CONSTANTS.COOKIES.PATH,
              secure: SERVICES_CONSTANTS.COOKIES.SECURE,
              sameSite: SERVICES_CONSTANTS.COOKIES.SAME_SITE_NONE,
            })
            .status(200)
            .json({ message: 'Logged out' });
          resolve(null);
        }
      });
    });
  }

  @Get(AUTH_CONSTANTS.ENDPOINTS.LOGOUT_RADARR)
  async logoutRadarr(@Req() req: any, @Res() res: Response): Promise<any> {
    return new Promise((resolve, reject) => {
      req.session.destroy((err) => {
        if (err) {
          reject(err);
        } else {
          const domain = this.configService.getDomainName();
          res
            .clearCookie(SERVICES_CONSTANTS.COOKIES.RADARR, {
              domain: domain,
              path: SERVICES_CONSTANTS.COOKIES.PATH,
              secure: SERVICES_CONSTANTS.COOKIES.SECURE,
              sameSite: SERVICES_CONSTANTS.COOKIES.SAME_SITE_NONE,
            })
            .status(200)
            .json({ message: 'Logged out' });
          resolve(null);
        }
      });
    });
  }

  @Get(AUTH_CONSTANTS.ENDPOINTS.LOGOUT_SONARR)
  async logoutSonarr(@Req() req: any, @Res() res: Response): Promise<any> {
    return new Promise((resolve, reject) => {
      req.session.destroy((err) => {
        if (err) {
          reject(err);
        } else {
          const domain = this.configService.getDomainName();
          res
            .clearCookie(SERVICES_CONSTANTS.COOKIES.SONARR, {
              domain: domain,
              path: SERVICES_CONSTANTS.COOKIES.PATH,
              secure: SERVICES_CONSTANTS.COOKIES.SECURE,
              sameSite: SERVICES_CONSTANTS.COOKIES.SAME_SITE_NONE,
            })
            .status(200)
            .json({ message: 'Logged out' });
          resolve(null);
        }
      });
    });
  }

  @Delete(AUTH_CONSTANTS.ENDPOINTS.DELETE_USER)
  async deleteUser(
    @Body('username') username: string,
    @Body('password') password: string,
  ) {
    const user = await this.usersService.getUser(username);
    if (!user) {
      throwException.Usernotfound();
    }
    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      throwException.IncorrectPassword();
    }
    await this.usersService.deleteUser(user);
    throwException.UserDeletedSuccessfully();
  }

  @UseGuards(AuthenticatedGuard)
  @Delete(AUTH_CONSTANTS.ENDPOINTS.DESTROY_ALL_SESSIONS)
  async destroyAllSessions(@Request() req) {
    await this.sessionService.deleteAllSessions(req.session.passport.user);
    throwSessionException.AllSessionsDestroyedSuccessfully();
  }

  @UseGuards(AuthenticatedGuard)
  @Get(AUTH_CONSTANTS.ENDPOINTS.GET_ALL_SESSIONS)
  async getAllSessions(@Request() req) {
    const sessions = await this.sessionService.getSessions(
      req.session.passport.user,
    );
    throwSessionException.AllSessionsFetchedSuccessfully(sessions);
  }
}
