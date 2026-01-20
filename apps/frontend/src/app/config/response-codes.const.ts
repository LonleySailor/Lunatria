/**
 * Frontend Response Code Constants
 *
 * This file defines constants for all application-specific response codes used by the frontend.
 * These constants should be imported instead of using magic numbers in component checks.
 *
 * Organized by category to match backend enum structure.
 *
 * Usage:
 * if (response.responseCode === RESPONSE_CODES.AUTH.USER_LOGGED_IN) { ... }
 */

export const RESPONSE_CODES = {
  /**
   * Authentication & User Operations (600s)
   */
  AUTH: {
    EMAIL_NEEDS_VERIFICATION: 601,
    INCORRECT_EMAIL: 602,
    INCORRECT_PASSWORD: 603,
    INVALID_VERIFICATION_CODE: 604,
    EMAIL_VERIFIED_SUCCESSFULLY: 605,
    VERIFICATION_CODE_SENT: 606,
    USERNAME_ALREADY_USED: 607,
    EMAIL_ALREADY_USED: 608,
    USER_LOGGED_IN: 609,
    USER_NOT_FOUND: 610,
    USER_LOGGED_OUT_SUCCESSFULLY: 611,
    PASSWORD_RESET_EMAIL_SENT: 612,
    INVALID_OR_EXPIRED_TOKEN: 613,
    PASSWORD_RESET_SUCCESSFULLY: 614,
    PLEASE_VERIFY_YOUR_EMAIL: 615,
    VERIFICATION_CODE_SENT_SUCCESSFULLY: 616,
    USER_DELETED_SUCCESSFULLY: 617,
    ONLY_FOR_ADMIN: 618,
    NO_SERVICE_ACCESS: 619,
  },

  /**
   * Session Management (700s)
   */
  SESSIONS: {
    ALL_SESSIONS_FETCHED_SUCCESSFULLY: 701,
    SESSION_NOT_FOUND: 702,
    ALL_SESSIONS_DESTROYED_SUCCESSFULLY: 703,
    SESSION_STATUS_FETCHED_SUCCESSFULLY: 704,
    USER_INFO_FETCHED_SUCCESSFULLY: 705,
  },

  /**
   * Credentials Management (800s)
   */
  CREDENTIALS: {
    CREDENTIALS_ALREADY_EXIST: 801,
  },

  /**
   * User Profiles & Settings (900s)
   */
  PROFILE: {
    PROFILE_PICTURE_REQUIRED: 901,
    INVALID_FILE_TYPE: 902,
    FILE_TOO_LARGE: 903,
    PROFILE_PICTURE_UPLOAD_FAILED: 904,
    NO_PROFILE_PICTURE_FOUND: 905,
    PROFILE_PICTURE_UPLOADED_SUCCESSFULLY: 906,
    PROFILE_PICTURE_DELETED_SUCCESSFULLY: 907,
  },
};
