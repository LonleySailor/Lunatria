/**
 * External services configuration
 */
export const SERVICES_CONSTANTS = {
  // Service names
  SERVICES: {
    JELLYFIN: 'jellyfin',
    RADARR: 'radarr',
    SONARR: 'sonarr',
    HOARDER: 'hoarder',
    NEXTCLOUD: 'nextcloud',
    VAULTWARDEN: 'vaultwarden',
    KOMGA: 'komga',
  } as const,

  // Cookie configuration
  COOKIES: {
    JELLYFIN: 'jellyfin_auth',
    RADARR: 'radarr_auth',
    SONARR: 'sonarr_auth',
    MAX_AGE_MS: 1000 * 60 * 60 * 24, // 24 hours in milliseconds
    HTTP_ONLY: true,
    SECURE: true,
    SAME_SITE_NONE: 'none' as const,
    SAME_SITE_LAX: 'lax' as const,
    PATH: '/',
  } as const,

  // Jellyfin specific
  JELLYFIN: {
    ENDPOINT_AUTH: '/Users/AuthenticateByName',
    AUTH_HEADER: 'X-Emby-Authorization',
    TOKEN_HEADER: 'X-Emby-Token',
    ROUTER_PREFIX: 'jellyfin',
    ROUTE: '/jellyfin',
  } as const,

  // Radarr specific
  RADARR: {
    ENDPOINT_AUTH: '/login',
    COOKIE_NAME: 'RadarrAuth',
    ROUTER_PREFIX: 'radarr',
    ROUTE: '/radarr',
  } as const,

  // Sonarr specific
  SONARR: {
    ENDPOINT_AUTH: '/login',
    COOKIE_NAME: 'SonarrAuth',
    ROUTER_PREFIX: 'sonarr',
    ROUTE: '/sonarr',
  } as const,
} as const;
