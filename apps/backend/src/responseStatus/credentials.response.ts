import { createCustomException } from './response.utils';
import { AuthResponseCode, CredentialsResponseCode } from './response-codes.enum';

class ThrowCredentialsExceptionClass {
  EmailNeedsVerification(): never {
    throw createCustomException(
      AuthResponseCode.EMAIL_NEEDS_VERIFICATION,
      422,
    );
  }

  CredentialsAlreadyExist(): never {
    throw createCustomException(CredentialsResponseCode.CREDENTIALS_ALREADY_EXIST, 409);
  }
}

export const throwCredentialsException = new ThrowCredentialsExceptionClass();
