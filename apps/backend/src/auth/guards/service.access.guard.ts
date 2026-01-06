import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { SessionsService } from '../../sessions/sessions.service';
import { UsersService } from 'src/users/users.service';
import { throwException } from 'src/responseStatus/auth.response';
import { Reflector } from '@nestjs/core';

@Injectable()
export class ServiceAccessGuard implements CanActivate {
  constructor(
    private readonly sessionsService: SessionsService,
    private readonly userService: UsersService,
    private readonly reflector: Reflector,
  ) { }

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const serviceName = this.reflector.get<string>(
      'service',
      context.getHandler(),
    );

    const session = request.session;
    await this.sessionsService.sessionErrorChecking(session);
    const user = await this.userService.getUserById(session.passport.user);

    if (!user) {
      throwException.NoServiceAccess();
    }

    if (user.userType === 'admin') return true;

    if (!Array.isArray(user.allowedServices)) {
      throwException.NoServiceAccess();
    }

    if (!serviceName || !user.allowedServices.includes(serviceName)) {
      throwException.NoServiceAccess(); // custom error handler
    }

    return true;
  }
}
