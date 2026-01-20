# Sessions Module

Base route: `/sessions` (controller: [apps/backend/src/sessions/sessions.controller.ts](../../../apps/backend/src/sessions/sessions.controller.ts))

## Endpoints
- GET `/getallsessions` (AuthenticatedGuard): Mirrors users controller; returns 701 with array.
- GET `/issessionactive`: Returns 704 with `true` or 702 if not found.
- GET `/getuserinfo`: Returns 705 with user info.

## Notes
- Redis stores session indices per user for multi-session tracking.
- `SessionMiddleware` is applied globally in [apps/backend/src/app.module.ts](../../../apps/backend/src/app.module.ts).