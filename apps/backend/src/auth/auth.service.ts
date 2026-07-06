import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { AUTH_CONSTANTS } from 'src/config/constants';

// Pre-computed hash of a throwaway value. When the user does not exist we still
// run a bcrypt.compare against this so the response time does not reveal whether
// the account exists (timing-based enumeration).
const DUMMY_HASH = bcrypt.hashSync(
  'unused-timing-guard',
  AUTH_CONSTANTS.BCRYPT_ROUNDS,
);

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}
  // Returns { userId } on success, or null for BOTH "user not found" and
  // "wrong password". Callers must surface a single generic failure so the two
  // cases are indistinguishable to the client.
  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.getUser(username);
    const passwordValid = await bcrypt.compare(
      password,
      user ? user.password : DUMMY_HASH,
    );
    if (user && passwordValid) {
      return {
        userId: user.id,
      };
    }
    return null;
  }
}
