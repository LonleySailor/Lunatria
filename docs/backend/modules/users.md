# Users Module

Base route: `/users` (controller: [apps/backend/src/users/users.controller.ts](../../../apps/backend/src/users/users.controller.ts))

## Endpoints
- POST `/register` (AdminGuard): Create a user.
  - Body: `username`, `password`, `email`, `usertype`, `allowedServices[]`
  - Errors: 607, 608
- POST `/login` (LocalAuthGuard): Authenticate and create a session.
  - Returns code 609 with `{ User }`
- GET `/logout`: Destroy session and clear core cookie.
- GET `/logout-jellyfin`: Clear Jellyfin/Radarr tokens and session.
- GET `/logout-radarr`: Clear Radarr cookie and session.
- GET `/logout-sonarr`: Clear Sonarr cookie and session.
- DELETE `/delete-user`: Self-delete account with username/password verification.
  - Returns code 617
- DELETE `/destroyallsessions` (AuthenticatedGuard): Delete all sessions for current user.
  - Returns code 703
- GET `/getallsessions` (AuthenticatedGuard): List active sessions.
  - Returns code 701 with an array

## Notes
- Hashing uses bcrypt with `AUTH_CONSTANTS.BCRYPT_ROUNDS`.
- Session cookie name comes from `APP_CONSTANTS.SESSION_NAME`.
- Cookie domains and flags are driven by `ConfigService` and `SERVICES_CONSTANTS.COOKIES`.