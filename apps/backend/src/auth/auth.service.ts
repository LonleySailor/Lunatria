import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { throwException } from 'src/responseStatus/auth.response';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}
  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.getUser(username);
    const passwordValid = await bcrypt.compare(password, user.password);
    if (!user) {
      throwException.Usernotfound();
    }
    if (user && passwordValid) {
      return {
        userId: user.id,
      };
    }
    return null;
  }
}
