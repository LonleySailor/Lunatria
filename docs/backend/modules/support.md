# Support Module

Base route: `/support` (controller: [apps/backend/src/support/support.controller.ts](../../../apps/backend/src/support/support.controller.ts))

## Endpoints
- GET `/services`: Public service status map.
- GET `/service-access` (AuthenticatedGuard): Query `service` name; returns `{ access: boolean }`.
- GET `/is-admin` (AdminGuard): Returns `{ isAdmin: true }` when authorized.