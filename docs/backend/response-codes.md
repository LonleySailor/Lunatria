# Response Codes

All controllers throw structured responses with a standardized payload shape. Response codes are defined using TypeScript enums in [apps/backend/src/responseStatus/response-codes.enum.ts](../../apps/backend/src/responseStatus/response-codes.enum.ts).

## Response Payload Format

```typescript
{
  statusCode: number,     // HTTP status (200, 401, 404, 409, etc.)
  responseCode: number,   // Application-specific code for detailed client handling
  ...data                 // Optional additional response data
}
```

## Using Response Codes in Backend

Import and use enums directly in exception handlers:

```typescript
import { throwException, throwSessionException, throwCredentialsException } from 'src/responseStatus';
import { AuthResponseCode, SessionResponseCode, CredentialsResponseCode } from 'src/responseStatus/response-codes.enum';

// Use enum values in exception methods (automatically handled by response utilities)
throwException.Usernotfound();  // Uses AuthResponseCode.USER_NOT_FOUND = 610
throwSessionException.SessionNotFound();  // Uses SessionResponseCode.SESSION_NOT_FOUND = 702
```

## Using Response Codes in Frontend

Import constants and use for response handling:

```typescript
import { RESPONSE_CODES } from 'src/app/config/response-codes.const';

if (response.responseCode === RESPONSE_CODES.AUTH.USER_LOGGED_IN) {
  // Login successful
}
if (response.responseCode === RESPONSE_CODES.SESSIONS.SESSION_NOT_FOUND) {
  // Session expired
}
```

---

## Auth Response Codes (600s)

| Code | Enum Name | HTTP Status | Description |
|------|-----------|-------------|-------------|
| 601 | `EMAIL_NEEDS_VERIFICATION` | 422 | Email verification required |
| 602 | `INCORRECT_EMAIL` | 401 | Incorrect email/username |
| 603 | `INCORRECT_PASSWORD` | 401 | Incorrect password |
| 604 | `INVALID_VERIFICATION_CODE` | 401 | Invalid/expired verification code |
| 605 | `EMAIL_VERIFIED_SUCCESSFULLY` | 200 | Email verified successfully |
| 606 | `VERIFICATION_CODE_SENT` | 200 | Verification code sent |
| 607 | `USERNAME_ALREADY_USED` | 409 | Username already taken |
| 608 | `EMAIL_ALREADY_USED` | 409 | Email already registered |
| 609 | `USER_LOGGED_IN` | 200 | Login successful (includes User data) |
| 610 | `USER_NOT_FOUND` | 404 | User does not exist |
| 611 | `USER_LOGGED_OUT_SUCCESSFULLY` | 200 | Logout successful |
| 612 | `PASSWORD_RESET_EMAIL_SENT` | 200 | Password reset email sent |
| 613 | `INVALID_OR_EXPIRED_TOKEN` | 401 | Token expired/invalid |
| 614 | `PASSWORD_RESET_SUCCESSFULLY` | 200 | Password changed successfully |
| 615 | `PLEASE_VERIFY_YOUR_EMAIL` | 202 | Email verification required (may include data) |
| 616 | `VERIFICATION_CODE_SENT_SUCCESSFULLY` | 200 | Verification code sent |
| 617 | `USER_DELETED_SUCCESSFULLY` | 200 | User account deleted |
| 618 | `ONLY_FOR_ADMIN` | 401 | Admin-only access denied |
| 619 | `NO_SERVICE_ACCESS` | 401 | User lacks service access |

**Source**: [apps/backend/src/responseStatus/auth.response.ts](../../apps/backend/src/responseStatus/auth.response.ts)

---

## Session Response Codes (700s)

| Code | Enum Name | HTTP Status | Description |
|------|-----------|-------------|-------------|
| 701 | `ALL_SESSIONS_FETCHED_SUCCESSFULLY` | 200 | Sessions retrieved |
| 702 | `SESSION_NOT_FOUND` | 401 | Session invalid/expired |
| 703 | `ALL_SESSIONS_DESTROYED_SUCCESSFULLY` | 200 | All sessions cleared |
| 704 | `SESSION_STATUS_FETCHED_SUCCESSFULLY` | 200 | Session active (boolean response) |
| 705 | `USER_INFO_FETCHED_SUCCESSFULLY` | 200 | User info loaded |

**Source**: [apps/backend/src/responseStatus/sessions.response.ts](../../apps/backend/src/responseStatus/sessions.response.ts)

---

## Credentials Response Codes (800s)

| Code | Enum Name | HTTP Status | Description |
|------|-----------|-------------|-------------|
| 801 | `CREDENTIALS_ALREADY_EXIST` | 409 | Credentials already stored for service |

**Source**: [apps/backend/src/responseStatus/credentials.response.ts](../../apps/backend/src/responseStatus/credentials.response.ts)

---

## Validation Error Codes (870s)

Used by `CustomValidationPipe` for input validation errors. When validation fails, the response includes:

```typescript
{
  statusCode: 400,
  code: 870,  // ValidationErrorCode.VALIDATION_ERROR_BASE
  errors: [
    {
      field: "fieldName",
      code: 871,  // Specific validation error (e.g., IS_NOT_EMPTY)
      issues: ["Field is required"]
    }
  ]
}
```

| Code | Enum Name | Validation Constraint |
|------|-----------|----------------------|
| 870 | `VALIDATION_ERROR_BASE` | General validation error |
| 871 | `IS_NOT_EMPTY` | Field required |
| 872 | `IS_STRING` | Must be string |
| 873 | `IS_DATE` | Must be valid date |
| 874 | `VALIDATE_IF` | Conditional validation failed |
| 875 | `TYPE_ERROR` | Type mismatch |
| 876 | `INVALID_RRULE` | Invalid recurrence rule |
| 877 | `IS_BOOLEAN` | Must be boolean |
| 878 | `IS_NUMBER` | Must be number |
| 879 | `IS_ARRAY` | Must be array |

**Source**: [apps/backend/src/responseStatus/response-codes.enum.ts](../../apps/backend/src/responseStatus/response-codes.enum.ts), [apps/backend/src/responseStatus/pipeline/calendar.custompipeline.response.ts](../../apps/backend/src/responseStatus/pipeline/calendar.custompipeline.response.ts)

---

## Profile & Settings Response Codes (900s)

| Code | Enum Name | HTTP Status | Description |
|------|-----------|-------------|-------------|
| 901 | `PROFILE_PICTURE_REQUIRED` | 400 | Profile picture is required |
| 902 | `INVALID_FILE_TYPE` | 400 | Invalid file type (JPG, PNG, GIF, WebP only) |
| 903 | `FILE_TOO_LARGE` | 413 | File exceeds maximum size (5MB) |
| 904 | `PROFILE_PICTURE_UPLOAD_FAILED` | 500 | Upload failed |
| 905 | `NO_PROFILE_PICTURE_FOUND` | 404 | No profile picture exists |
| 906 | `PROFILE_PICTURE_UPLOADED_SUCCESSFULLY` | 200 | Profile picture uploaded |
| 907 | `PROFILE_PICTURE_DELETED_SUCCESSFULLY` | 200 | Profile picture deleted |

**Source**: [apps/backend/src/responseStatus/response-codes.enum.ts](../../apps/backend/src/responseStatus/response-codes.enum.ts)
