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
import { HttpService } from '@nestjs/axios';
import Redis from 'ioredis';

@Controller('users')
export class UsersController {
  private readonly redis: Redis;

  constructor(
    private readonly usersService: UsersService,
    private readonly sessionService: SessionsService,
    private httpService: HttpService,
  ) {
    this.redis = new Redis(process.env.REDIS_URL);
  }
  @UseGuards(AdminGuard)
  @Post('/register')
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
    const saltOrRounds = 10;
    const hashedPassword = await bcrypt.hash(userPassword, saltOrRounds);
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
  @Post('/login')
  async login(
    @Request() req,
    @Body('username') userName: string,
  ): Promise<any> {
    const user = await this.usersService.getUser(userName);
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

  @Get('/logout')
  async logout(@Req() req: any, @Res() res: Response): Promise<any> {
    return new Promise((resolve, reject) => {
      req.session.destroy((err) => {
        if (err) {
          reject(err);
        } else {
          const domain = process.env.DOMAIN;
          res
            .clearCookie('LunatriaSession', {
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
  @Get('logout-jellyfin')
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
          const domain = process.env.DOMAIN;
          res
            .clearCookie('jellyfin_auth', {
              domain: domain, // note the dot for subdomain-wide
              path: '/',
              secure: true,
              sameSite: 'none',
            })
            .status(200)
            .json({ message: 'Logged out' });
          resolve(null);
        }
      });
    });
  }

  @Get('logout-radarr')
  async logoutRadarr(@Req() req: any, @Res() res: Response): Promise<any> {
    return new Promise((resolve, reject) => {
      req.session.destroy((err) => {
        if (err) {
          reject(err);
        } else {
          const domain = process.env.DOMAIN;
          res
            .clearCookie('radarr_auth', {
              domain: domain, // note the dot for subdomain-wide
              path: '/',
              secure: true,
              sameSite: 'none',
            })
            .status(200)
            .json({ message: 'Logged out' });
          resolve(null);
        }
      });
    });
  }
  @Get('logout-sonarr')
  async logoutSonarr(@Req() req: any, @Res() res: Response): Promise<any> {
    return new Promise((resolve, reject) => {
      req.session.destroy((err) => {
        if (err) {
          reject(err);
        } else {
          const domain = process.env.DOMAIN;
          res
            .clearCookie('sonarr_auth', {
              domain: domain, // note the dot for subdomain-wide
              path: '/',
              secure: true,
              sameSite: 'none',
            })
            .status(200)
            .json({ message: 'Logged out' });
          resolve(null);
        }
      });
    });
  }

  @Delete('delete-user')
  async deleteUser(
    @Body('userName') userName: string,
    @Body('password') password: string,
  ) {
    const user = await this.usersService.getUser(userName);
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
  @Delete('destroyallsessions')
  async destroyAllSessions(@Request() req) {
    await this.sessionService.deleteAllSessions(req.session.passport.user);
    throwSessionException.AllSessionsDestroyedSuccessfully();
  }

  @UseGuards(AuthenticatedGuard)
  @Get('getallsessions')
  async getAllSessions(@Request() req) {
    const sessions = await this.sessionService.getSessions(
      req.session.passport.user,
    );
    throwSessionException.AllSessionsFetchedSuccessfully(sessions);
  }
}
