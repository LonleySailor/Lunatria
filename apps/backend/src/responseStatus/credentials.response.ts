import { createCustomException } from './response.utils';

class ThrowCredentialsExceptionClass {
  EmailNeedsVerification(): never {
    throw createCustomException(
      601 /*Custom response code*/,
      422 /*Status Code  403*/,
    );
  }
  CredentialsAlreadyExist(): never {
    throw createCustomException(801, 409);
  }
}

export const throwCredentialsException = new ThrowCredentialsExceptionClass();
