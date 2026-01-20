import { createCustomException } from './response.utils';
import { SessionResponseCode } from './response-codes.enum';

class ThrowSessionExceptionClass {
  AllSessionsFetchedSuccessfully(data: any): never {
    throw createCustomException(SessionResponseCode.ALL_SESSIONS_FETCHED_SUCCESSFULLY, 200, data);
  }

  SessionNotFound(): never {
    throw createCustomException(SessionResponseCode.SESSION_NOT_FOUND, 401);
  }

  AllSessionsDestroyedSuccessfully(): never {
    throw createCustomException(SessionResponseCode.ALL_SESSIONS_DESTROYED_SUCCESSFULLY, 200);
  }

  SessionStatusFetchedSuccessfully(isSessionActive: boolean): never {
    throw createCustomException(SessionResponseCode.SESSION_STATUS_FETCHED_SUCCESSFULLY, 200, isSessionActive);
  }

  UserInfoFetchedSuccessfully(user: any): never {
    throw createCustomException(SessionResponseCode.USER_INFO_FETCHED_SUCCESSFULLY, 200, user);
  }
}

export const throwSessionException = new ThrowSessionExceptionClass();
