import { createCustomException } from './response.utils';
import {
  AuthResponseCode,
  CredentialsResponseCode,
} from './response-codes.enum';

class ThrowCredentialsExceptionClass {
  EmailNeedsVerification(): never {
    throw createCustomException(AuthResponseCode.EMAIL_NEEDS_VERIFICATION, 422);
  }

  CredentialsAlreadyExist(): never {
    throw createCustomException(
      CredentialsResponseCode.CREDENTIALS_ALREADY_EXIST,
      409,
    );
  }

  ServiceRegistrationFailed(message?: string): never {
    throw createCustomException(
      CredentialsResponseCode.SERVICE_REGISTRATION_FAILED,
      502,
      message ? { message } : undefined,
    );
  }

  JellyfinUserCreationFailed(message?: string): never {
    throw createCustomException(
      CredentialsResponseCode.JELLYFIN_USER_CREATION_FAILED,
      502,
      message ? { message } : undefined,
    );
  }

  AdminServiceCredentialsMissing(): never {
    throw createCustomException(
      CredentialsResponseCode.ADMIN_SERVICE_CREDENTIALS_MISSING,
      400,
    );
  }

  CredentialsNotFound(): never {
    throw createCustomException(
      CredentialsResponseCode.CREDENTIALS_NOT_FOUND,
      404,
    );
  }

  JellyfinUserDeletionFailed(message?: string): never {
    throw createCustomException(
      CredentialsResponseCode.JELLYFIN_USER_DELETION_FAILED,
      502,
      message ? { message } : undefined,
    );
  }
}

export const throwCredentialsException = new ThrowCredentialsExceptionClass();
