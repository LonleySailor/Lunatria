import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { CredentialsService } from 'src/credentials/credentials.service';
import { JellyfinService } from 'src/proxy/jellyfin/jellyfin.service';
import { ConfigService } from 'src/config/config.service';
import { SSO_SERVICES, SERVICES_CONSTANTS } from 'src/config/constants';
import { throwException } from 'src/responseStatus/auth.response';
import { throwCredentialsException } from 'src/responseStatus/credentials.response';
import { generateRandomPassword } from 'src/common/password.util';

export interface RegisterCredentialBody {
  service: string;
  targetUser: string;
  autoRegister?: boolean;
  username?: string;
  password?: string;
  email?: string;
}

export interface GrantAccessBody {
  service: string;
  targetUser: string;
}

const JELLYFIN_PASSWORD_LENGTH = 16;

@Injectable()
export class AdminService {
  constructor(
    private readonly usersService: UsersService,
    private readonly credentialsService: CredentialsService,
    private readonly jellyfinService: JellyfinService,
    private readonly configService: ConfigService,
  ) {}

  /** Services available for SSO / auto-registration (static config). */
  getSsoServices() {
    return SSO_SERVICES;
  }

  /** Users that do not yet have a stored credential for the given service. */
  async getUsersWithoutCredential(service: string) {
    const [users, userIdsWithCred] = await Promise.all([
      this.usersService.getAllUsers(),
      this.credentialsService.getUserIdsWithService(service),
    ]);
    const taken = new Set(userIdsWithCred.map((id) => id.toString()));
    return users
      .filter((u) => !taken.has(u._id.toString()))
      .map((u) => ({
        id: u._id.toString(),
        username: u.username,
        email: u.email,
      }));
  }

  /**
   * Users that do not have access (allowedServices) to the given service.
   * Includes admins (flagged via userType) and notes whether each user already
   * has stored credentials for the service, so the UI can warn when missing.
   */
  async getUsersWithoutAccess(service: string) {
    const [users, userIdsWithCred] = await Promise.all([
      this.usersService.getAllUsers(),
      this.credentialsService.getUserIdsWithService(service),
    ]);
    const withCredentials = new Set(userIdsWithCred.map((id) => id.toString()));
    return users
      .filter((u) => !(u.allowedServices ?? []).includes(service))
      .map((u) => ({
        id: u._id.toString(),
        username: u.username,
        email: u.email,
        userType: u.userType,
        hasCredentials: withCredentials.has(u._id.toString()),
      }));
  }

  /**
   * Grant a user access to a service by adding it to their allowedServices[].
   * Does not touch credentials (the two axes are managed independently).
   */
  async grantAccess(body: GrantAccessBody) {
    const { service, targetUser } = body;
    const user = await this.usersService.getUser(targetUser);
    if (!user) throwException.Usernotfound();
    if ((user.allowedServices ?? []).includes(service)) {
      throwException.UserAlreadyHasAccess();
    }
    await this.usersService.addAllowedService(user._id.toString(), service);
    return { success: true, service, targetUser };
  }

  /**
   * Register a credential for a user. When autoRegister is enabled (default),
   * the backend provisions the account in the target service; otherwise the
   * admin-provided credentials are stored verbatim (manual fallback).
   */
  async registerCredential(body: RegisterCredentialBody, adminUserId: string) {
    const { service, targetUser, autoRegister, username, password, email } =
      body;

    const userId = await this.usersService.getUserId(targetUser);
    if (!userId) throwException.Usernotfound();

    const existing = await this.credentialsService.getCredential(
      userId,
      service,
    );
    if (existing) throwCredentialsException.CredentialsAlreadyExist();

    if (autoRegister === false) {
      await this.credentialsService.setCredential(userId, service, {
        username,
        password,
        email,
      });
      return { success: true, service, targetUser };
    }

    switch (service) {
      case SERVICES_CONSTANTS.SERVICES.JELLYFIN:
        await this.registerJellyfin(userId, targetUser, adminUserId);
        break;
      case SERVICES_CONSTANTS.SERVICES.RADARR:
        await this.registerStaticService(
          userId,
          service,
          this.configService.getRadarrServiceCredentials(),
        );
        break;
      case SERVICES_CONSTANTS.SERVICES.SONARR:
        await this.registerStaticService(
          userId,
          service,
          this.configService.getSonarrServiceCredentials(),
        );
        break;
      default:
        throwCredentialsException.ServiceRegistrationFailed(
          `Auto-registration is not supported for service "${service}"`,
        );
    }

    return { success: true, service, targetUser };
  }

  /**
   * Jellyfin is multi-user: create a real account named after the Lunatria
   * user, with a generated password, then store those credentials.
   */
  private async registerJellyfin(
    userId: string,
    username: string,
    adminUserId: string,
  ) {
    const password = generateRandomPassword(JELLYFIN_PASSWORD_LENGTH);
    try {
      await this.jellyfinService.createUser(adminUserId, username, password);
    } catch (error) {
      throwCredentialsException.JellyfinUserCreationFailed(error.message);
    }
    await this.credentialsService.setCredential(
      userId,
      SERVICES_CONSTANTS.SERVICES.JELLYFIN,
      { username, password },
    );
  }

  /**
   * Radarr/Sonarr are single-user: store the shared credentials from env so
   * the proxy can log in. No external account creation is needed.
   */
  private async registerStaticService(
    userId: string,
    service: string,
    creds: { username: string; password: string; apiKey: string },
  ) {
    if (!creds.username || !creds.password) {
      throwCredentialsException.AdminServiceCredentialsMissing();
    }
    await this.credentialsService.setCredential(userId, service, creds);
  }
}
