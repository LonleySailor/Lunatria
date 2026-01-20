/**
 * Centralized Response Codes Enum
 *
 * This file defines all application-specific response codes used across the system.
 * Response codes are organized by category (600s, 700s, 800s, 900s) and combined
 * with HTTP status codes to provide detailed feedback to clients.
 *
 * Format: { statusCode: number, responseCode: number, ...data }
 *
 * Categories:
 * - 600s: Authentication & User Operations
 * - 700s: Session Management
 * - 800s: Credentials Management
 * - 870s: Validation Errors (CLI tool validation)
 * - 900s: User Profiles & Settings
 */

/**
 * Authentication & User Operations (600s)
 */
export enum AuthResponseCode {
  EMAIL_NEEDS_VERIFICATION = 601,
  INCORRECT_EMAIL = 602,
  INCORRECT_PASSWORD = 603,
  INVALID_VERIFICATION_CODE = 604,
  EMAIL_VERIFIED_SUCCESSFULLY = 605,
  VERIFICATION_CODE_SENT = 606,
  USERNAME_ALREADY_USED = 607,
  EMAIL_ALREADY_USED = 608,
  USER_LOGGED_IN = 609,
  USER_NOT_FOUND = 610,
  USER_LOGGED_OUT_SUCCESSFULLY = 611,
  PASSWORD_RESET_EMAIL_SENT = 612,
  INVALID_OR_EXPIRED_TOKEN = 613,
  PASSWORD_RESET_SUCCESSFULLY = 614,
  PLEASE_VERIFY_YOUR_EMAIL = 615,
  VERIFICATION_CODE_SENT_SUCCESSFULLY = 616,
  USER_DELETED_SUCCESSFULLY = 617,
  ONLY_FOR_ADMIN = 618,
  NO_SERVICE_ACCESS = 619,
}

/**
 * Session Management (700s)
 */
export enum SessionResponseCode {
  ALL_SESSIONS_FETCHED_SUCCESSFULLY = 701,
  SESSION_NOT_FOUND = 702,
  ALL_SESSIONS_DESTROYED_SUCCESSFULLY = 703,
  SESSION_STATUS_FETCHED_SUCCESSFULLY = 704,
  USER_INFO_FETCHED_SUCCESSFULLY = 705,
}

/**
 * Credentials Management (800s)
 */
export enum CredentialsResponseCode {
  CREDENTIALS_ALREADY_EXIST = 801,
}

/**
 * Validation Error Codes (870s)
 * Used by CustomValidationPipe for input validation
 */
export enum ValidationErrorCode {
  VALIDATION_ERROR_BASE = 870,
  IS_NOT_EMPTY = 871,
  IS_STRING = 872,
  IS_DATE = 873,
  VALIDATE_IF = 874,
  TYPE_ERROR = 875,
  INVALID_RRULE = 876,
  IS_BOOLEAN = 877,
  IS_NUMBER = 878,
  IS_ARRAY = 879,
}

/**
 * User Profiles & Settings (900s)
 */
export enum ProfileResponseCode {
  PROFILE_PICTURE_REQUIRED = 901,
  INVALID_FILE_TYPE = 902,
  FILE_TOO_LARGE = 903,
  PROFILE_PICTURE_UPLOAD_FAILED = 904,
  NO_PROFILE_PICTURE_FOUND = 905,
  PROFILE_PICTURE_UPLOADED_SUCCESSFULLY = 906,
  PROFILE_PICTURE_DELETED_SUCCESSFULLY = 907,
}

/**
 * Validation Error Code Mapping
 * Maps validation constraint names to their corresponding error codes
 */
export const VALIDATION_ERROR_CODE_MAP: Record<string, number> = {
  isNotEmpty: ValidationErrorCode.IS_NOT_EMPTY,
  isString: ValidationErrorCode.IS_STRING,
  isDate: ValidationErrorCode.IS_DATE,
  validateIf: ValidationErrorCode.VALIDATE_IF,
  typeError: ValidationErrorCode.TYPE_ERROR,
  invalidRRule: ValidationErrorCode.INVALID_RRULE,
  isBoolean: ValidationErrorCode.IS_BOOLEAN,
  isNumber: ValidationErrorCode.IS_NUMBER,
  isArray: ValidationErrorCode.IS_ARRAY,
};
