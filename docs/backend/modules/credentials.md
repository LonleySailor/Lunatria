# Credentials Module

Base route: `/credentials` (controller: [apps/backend/src/credentials/credentials.controller.ts](../../../apps/backend/src/credentials/credentials.controller.ts))

## Endpoints (AdminGuard)
- POST `/add`: Add credentials for `targetUser` and `service`.
  - Body: `{ targetUser, service, username, password }`
  - Errors: 801, 610
- GET `/:service`: Get current user's credentials for a service.
- PATCH `/:service`: Upsert current user's credentials for a service.
- DELETE `/:service`: Delete current user's credentials for a service.

## Notes
- Service names: see `SERVICES_CONSTANTS.SERVICES`.
- Credential values are encrypted at rest (see `CREDENTIAL_ENCRYPTION_KEY`).