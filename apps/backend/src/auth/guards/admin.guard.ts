import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { SessionsService } from '../../sessions/sessions.service';
import { UsersService } from 'src/users/users.service';
import { throwException } from 'src/responseStatus/auth.response';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    private readonly sessionsService: SessionsService,
    private readonly userService: UsersService,
  ) { }

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const sessionRequest = request.session;
    await this.sessionsService.sessionErrorChecking(sessionRequest);
    const user = await this.userService.getUserById(
      sessionRequest.passport.user,
    );
    if (user.userType === 'admin') {
      return true;
    }
    throwException.OnlyForAdmin();
  }
}
