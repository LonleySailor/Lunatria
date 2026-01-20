# Config Service

Source: [apps/backend/src/config/config.service.ts](../../../apps/backend/src/config/config.service.ts)

## Highlights
- Database: `getMongodbUri()` reads `MONGODB_URI`.
- Redis: `getRedisUrl()` reads `REDIS_URL` with default.
- Domain/Public URLs: `getDomainName()`, `buildServiceUrl()`, `get*PublicUrl()` for Jellyfin, Radarr, Sonarr and others.
- Security: `getPassportSecret()`, `getCredentialEncryptionKey()`.
- Cookie ages: `getSessionCookieMaxAge()`, `getServiceCookieMaxAge()`.
- Internal service URLs: `get*BaseUrl()` for Jellyfin, Radarr, Sonarr.

See [docs/backend/environment.md](../environment.md) for all variable definitions.