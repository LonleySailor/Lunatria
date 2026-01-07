# Proxy Module

Controllers:
- Jellyfin: base route `/jellyfin` ([apps/backend/src/proxy/jellyfin/jellyfin.controller.ts](../../../apps/backend/src/proxy/jellyfin/jellyfin.controller.ts))
- Radarr: base route `/radarr` ([apps/backend/src/proxy/radarr/radarr.controller.ts](../../../apps/backend/src/proxy/radarr/radarr.controller.ts))
- Sonarr: base route `/sonarr` ([apps/backend/src/proxy/sonarr/sonarr.controller.ts](../../../apps/backend/src/proxy/sonarr/sonarr.controller.ts))

## Behavior
- All controllers guard with `ServiceAccessGuard` and `@Service(<name>)`.
- First access issues a service cookie (`*_auth`) and redirects to the public service URL.
- Cookie settings use `SERVICES_CONSTANTS.COOKIES` and `ConfigService` for domain and max age.

## Jellyfin
- Path: `ALL /*`
- On first visit: generates Jellyfin token and redirects to `/sso-bridge.html` with query params (`token`, `userId`, `serverId`).

## Radarr / Sonarr
- Path: `ALL /*`
- On first visit: obtains `RadarrAuth`/`SonarrAuth` cookie from service, sets it for the browser, then redirects to public URL.

## Configuration
- Public URLs: derived from domain or overridden by `*_PUBLIC_URL` envs.
- Internal URLs: `*_BASE_URL` envs.