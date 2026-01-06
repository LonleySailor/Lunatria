/**
 * Domain and URL configuration
 */
export const DOMAIN_CONSTANTS = {
  // Protocol
  PROTOCOL_HTTPS: 'https',
  PROTOCOL_HTTP: 'http',

  // URL builders (use env vars from config service)
  // This file documents the structure; actual URLs are built from env vars

  // Service URLs will be dynamically constructed from:
  // - DOMAIN_NAME (e.g., lunatria.com)
  // - SERVICES map with subdomain mapping

  SERVICE_SUBDOMAINS: {
    JELLYFIN: 'jellyfin',
    RADARR: 'radarr',
    SONARR: 'sonarr',
    HOARDER: 'hoarder',
    NEXTCLOUD: 'nextcloud',
    VAULTWARDEN: 'vaultwarden',
    KOMGA: 'komga',
    API: 'api',
  } as const,
} as const;
