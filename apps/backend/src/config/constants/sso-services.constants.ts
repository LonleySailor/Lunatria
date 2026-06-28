/**
 * Static list of services that support SSO / auto-registration via Lunatria.
 *
 * This is the single source of truth surfaced to the admin panel through
 * `GET /admin/services`. Never hardcode the service list in the frontend.
 */
import { SERVICES_CONSTANTS } from './services.constants';

export interface SsoServiceConfig {
  /** Internal service name (must match SERVICES_CONSTANTS.SERVICES) */
  name: string;
  /** Human-readable label shown in the UI */
  label: string;
  /** Whether the credential form should collect an email for this service */
  requiresEmail: boolean;
  /** Whether the backend can create the service account automatically */
  supportsAutoRegister: boolean;
}

export const SSO_SERVICES: readonly SsoServiceConfig[] = [
  {
    name: SERVICES_CONSTANTS.SERVICES.JELLYFIN,
    label: 'Jellyfin',
    requiresEmail: false,
    supportsAutoRegister: true,
  },
  {
    name: SERVICES_CONSTANTS.SERVICES.RADARR,
    label: 'Radarr',
    requiresEmail: false,
    supportsAutoRegister: true,
  },
  {
    name: SERVICES_CONSTANTS.SERVICES.SONARR,
    label: 'Sonarr',
    requiresEmail: false,
    supportsAutoRegister: true,
  },
] as const;
