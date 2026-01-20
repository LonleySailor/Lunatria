import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AUTH_CONSTANTS } from 'src/config/constants';
@Injectable()
export class LocalAuthGuard extends AuthGuard(AUTH_CONSTANTS.LOCAL_STRATEGY) {
  async canActivate(context: ExecutionContext) {
    const result = (await super.canActivate(context)) as boolean;
    const request = context.switchToHttp().getRequest();
    await super.logIn(request);
    return result;
  }
}
