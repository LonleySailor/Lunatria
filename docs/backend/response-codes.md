# Response Codes

All controllers throw structured responses using [apps/backend/src/responseStatus/response.utils.ts](../../apps/backend/src/responseStatus/response.utils.ts). The payload shape is:

```
{
  statusCode: number,     # HTTP status
  responseCode: number,   # Application-specific code
  ...data                 # Optional additional data
}
```

## Auth (600s)
- `601` (422): Email needs verification
- `602` (401): Incorrect email/username
- `603` (401): Incorrect password
- `604` (401): Invalid verification code
- `605` (200): Email verified successfully
- `606` (200): Verification code sent
- `607` (409): Username already used
- `608` (409): Email already used
- `609` (200): User logged in (includes `{ User: string }`)
- `610` (404): User not found
- `611` (200): User logged out successfully
- `612` (200): Password reset email sent
- `613` (401): Invalid or expired token
- `614` (200): Password reset successfully
- `615` (202): Please verify your email (may include data)
- `616` (200): Verification code sent successfully
- `617` (200): User deleted successfully
- `618` (401): Only for admin
- `619` (401): No service access

Source: [apps/backend/src/responseStatus/auth.response.ts](../../apps/backend/src/responseStatus/auth.response.ts)

## Sessions (700s)
- `701` (200): All sessions fetched successfully
- `702` (401): Session not found
- `703` (200): All sessions destroyed successfully
- `704` (200): Session status fetched successfully (boolean)
- `705` (200): User info fetched successfully

Source: [apps/backend/src/responseStatus/sessions.response.ts](../../apps/backend/src/responseStatus/sessions.response.ts)

## Credentials (800s)
- `801` (409): Credentials already exist

Source: [apps/backend/src/responseStatus/credentials.response.ts](../../apps/backend/src/responseStatus/credentials.response.ts)