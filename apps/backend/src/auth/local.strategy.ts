import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { throwException } from 'src/responseStatus/auth.response';
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {
    super({ usernameField: 'username' });
  }
  async validate(username: string, password: string): Promise<any> {
    const user = await this.usersService.getUser(username);
    if (!user) {
      throwException.IncorrectEmail();
    }

    const userCredentials = await this.authService.validateUser(
      username,
      password,
    );
    if (!userCredentials) {
      throwException.IncorrectPassword();
    }
    return userCredentials;
  }
}
