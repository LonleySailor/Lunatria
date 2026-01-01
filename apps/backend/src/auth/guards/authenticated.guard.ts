import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { SessionsService } from '../../sessions/sessions.service';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  constructor(private readonly sessionsService: SessionsService) { }

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const sessionRequest = request.session;
    await this.sessionsService.sessionErrorChecking(sessionRequest);
    return request.isAuthenticated();
  }
}
