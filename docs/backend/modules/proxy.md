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
- On first visit: sets the Jellyfin service cookie, redirects to `/jellyfin-login-bridge.html`, and the bridge page fetches `/jellyfin/get-auth-data` from the authenticated API to receive `accessToken`, `userId`, and `serverId`.
- The auth-data endpoint is protected by `AuthenticatedGuard` and avoids exposing the token in the redirect URL.

## Radarr / Sonarr
- Path: `ALL /*`
- On first visit: obtains `RadarrAuth`/`SonarrAuth` cookie from service, sets it for the browser, then redirects to public URL.

## Configuration
- Public URLs: derived from domain or overridden by `*_PUBLIC_URL` envs.
- Internal URLs: `*_BASE_URL` envs.