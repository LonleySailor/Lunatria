import { createCustomException } from './response.utils';
import { AuthResponseCode } from './response-codes.enum';

class ThrowAuthExceptionClass {
  EmailNeedsVerification(): never {
    throw createCustomException(
      AuthResponseCode.EMAIL_NEEDS_VERIFICATION,
      422,
    );
  }

  IncorrectEmail(): never {
    throw createCustomException(AuthResponseCode.INCORRECT_EMAIL, 401);
  }

  IncorrectPassword(): never {
    throw createCustomException(AuthResponseCode.INCORRECT_PASSWORD, 401);
  }

  InvalidVerificationCode(): never {
    throw createCustomException(AuthResponseCode.INVALID_VERIFICATION_CODE, 401);
  }

  EmailVerifiedSuccessfully(): never {
    throw createCustomException(AuthResponseCode.EMAIL_VERIFIED_SUCCESSFULLY, 200);
  }

  VerificationCodeSent(): never {
    throw createCustomException(AuthResponseCode.VERIFICATION_CODE_SENT, 200);
  }

  UsernameAlreadyUsed(): never {
    throw createCustomException(AuthResponseCode.USERNAME_ALREADY_USED, 409);
  }

  EmailAlreadyUsed(): never {
    throw createCustomException(AuthResponseCode.EMAIL_ALREADY_USED, 409);
  }

  UserloggedIn(data?: any): never {
    throw createCustomException(AuthResponseCode.USER_LOGGED_IN, 200, data);
  }

  Usernotfound(): never {
    throw createCustomException(AuthResponseCode.USER_NOT_FOUND, 404);
  }

  UserLoggedOutSuccessfully(): never {
    throw createCustomException(AuthResponseCode.USER_LOGGED_OUT_SUCCESSFULLY, 200);
  }

  PasswordResetEmailSentSuccessfully(): never {
    throw createCustomException(AuthResponseCode.PASSWORD_RESET_EMAIL_SENT, 200);
  }

  InvalidOrExpiredToken(): never {
    throw createCustomException(AuthResponseCode.INVALID_OR_EXPIRED_TOKEN, 401);
  }

  PasswordResetSuccessfully(): never {
    throw createCustomException(AuthResponseCode.PASSWORD_RESET_SUCCESSFULLY, 200);
  }

  PleaseVerifyYourEmail(data?: any): never {
    throw createCustomException(AuthResponseCode.PLEASE_VERIFY_YOUR_EMAIL, 202, data);
  }

  VerificationCodeSentSuccessfully(): never {
    throw createCustomException(AuthResponseCode.VERIFICATION_CODE_SENT_SUCCESSFULLY, 200);
  }

  UserDeletedSuccessfully(): never {
    throw createCustomException(AuthResponseCode.USER_DELETED_SUCCESSFULLY, 200);
  }

  OnlyForAdmin(): never {
    throw createCustomException(AuthResponseCode.ONLY_FOR_ADMIN, 401);
  }

  NoServiceAccess(): never {
    throw createCustomException(AuthResponseCode.NO_SERVICE_ACCESS, 401);
  }
}

export const throwException = new ThrowAuthExceptionClass();
