# Audit Module

Base route: `/audit` (controller: [apps/backend/src/audit/audit.controller.ts](../../../apps/backend/src/audit/audit.controller.ts))

## Endpoints (AdminGuard)
- GET `/`: Query params `userId`, `service`, `status` (`success|fail`), `limit` (default 100). Returns filtered audit logs.

## Notes
- Designed for admin observability into proxy/auth flows.