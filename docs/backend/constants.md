# Backend Constants

This document summarizes strongly-typed constants used across the backend. All constants are exported from [apps/backend/src/config/constants/index.ts](../../apps/backend/src/config/constants/index.ts).

## `APP_CONSTANTS`
- `APP_NAME`: Application display name.
- `SESSION_NAME`: Express session cookie name.
- `TRUST_PROXY`: Whether the app trusts reverse proxies.

Source: [apps/backend/src/config/constants/app.constants.ts](../../apps/backend/src/config/constants/app.constants.ts)

## `AUTH_CONSTANTS`
- `USER_TYPES`: `admin`, `user`.
- `ROUTES`: logical route names (`auth`, `users`, `sessions`).
- `CONTROLLERS`: base route segments (`users`, `credentials`, `audit`, `sessions`, `support`).
- `ENDPOINTS`: `login`, `logout`, `register`, `delete-user`, `logout-jellyfin`, `logout-radarr`, `logout-sonarr`, `getallsessions`, `issessionactive`, `getuserinfo`, `destroyallsessions`.
- `DECORATORS`: `service`.
- `LOCAL_STRATEGY`: `local`.
- `BCRYPT_ROUNDS`: `10`.
- `ENCRYPTION.ALGORITHM`: `aes-256-cbc`.

Source: [apps/backend/src/config/constants/auth.constants.ts](../../apps/backend/src/config/constants/auth.constants.ts)

## `DATABASE_CONSTANTS`
- `SCHEMAS.USER`: Mongoose model name for users.

Source: [apps/backend/src/config/constants/database.constants.ts](../../apps/backend/src/config/constants/database.constants.ts)

## `DOMAIN_CONSTANTS`
- `PROTOCOL_HTTPS`, `PROTOCOL_HTTP`.
- `SERVICE_SUBDOMAINS`: `jellyfin`, `radarr`, `sonarr`, `hoarder`, `nextcloud`, `vaultwarden`, `komga`, `api`.

Source: [apps/backend/src/config/constants/domain.constants.ts](../../apps/backend/src/config/constants/domain.constants.ts)

## `SERVICES_CONSTANTS`
- `SERVICES`: canonical service names.
- `COOKIES`: cookie names and defaults (httpOnly, secure, sameSite, path, max-age).
- `JELLYFIN`: `ENDPOINT_AUTH`, `AUTH_HEADER`, `TOKEN_HEADER`, `ROUTE`.
- `RADARR`: `ENDPOINT_AUTH`, `COOKIE_NAME`, `ROUTE`.
- `SONARR`: `ENDPOINT_AUTH`, `COOKIE_NAME`, `ROUTE`.

Source: [apps/backend/src/config/constants/services.constants.ts](../../apps/backend/src/config/constants/services.constants.ts)
