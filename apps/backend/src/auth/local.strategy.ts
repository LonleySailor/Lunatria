import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from './auth.service';
import { throwException } from 'src/responseStatus/auth.response';
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({ usernameField: 'username' });
  }
  async validate(username: string, password: string): Promise<any> {
    const userCredentials = await this.authService.validateUser(
      username,
      password,
    );
    if (!userCredentials) {
      // Single generic error for missing-user and wrong-password alike.
      throwException.InvalidCredentials();
    }
    return userCredentials;
  }
}
