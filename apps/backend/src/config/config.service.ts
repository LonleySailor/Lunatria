import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { SERVICES_CONSTANTS, DOMAIN_CONSTANTS } from './constants';

dotenv.config();

/**
 * Centralized configuration service for accessing environment variables
 * Provides type-safe access to all configuration with defaults
 */
@Injectable()
export class ConfigService {
  // ============ Application ============
  getPort(): number {
    return Number(process.env.PORT) || 3000;
  }

  // ============ Database ============
  getMongodbUri(): string {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI environment variable not set');
    }
    return uri;
  }

  // ============ Redis ============
  getRedisUrl(): string {
    return process.env.REDIS_URL || 'redis://127.0.0.1:6380';
  }

  // ============ Domain & Networking ============
  /**
   * Get root domain name (e.g., lunatria.com)
   */
  getDomainName(): string {
    const domain = process.env.DOMAIN_NAME || process.env.DOMAIN;
    if (!domain) {
      throw new Error('DOMAIN_NAME or DOMAIN environment variable not set');
    }
    return domain;
  }

  /**
   * Get the protocol for CORS and URLs
   */
  getCorsProtocol(): string {
    return process.env.CORS_PROTOCOL || 'https';
  }

  /**
   * Build a service URL from domain and subdomain
   */
  buildServiceUrl(subdomain: string): string {
    return `${this.getCorsProtocol()}://${subdomain}.${this.getDomainName()}`;
  }

  /**
   * Get API URL
   */
  getApiUrl(): string {
    return this.buildServiceUrl(DOMAIN_CONSTANTS.SERVICE_SUBDOMAINS.API);
  }

  /**
   * Get Jellyfin public URL
   */
  getJellyfinPublicUrl(): string {
    return (
      process.env.JELLYFIN_PUBLIC_URL ||
      this.buildServiceUrl(DOMAIN_CONSTANTS.SERVICE_SUBDOMAINS.JELLYFIN)
    );
  }

  /**
   * Get Radarr public URL
   */
  getRadarrPublicUrl(): string {
    return (
      process.env.RADARR_PUBLIC_URL ||
      this.buildServiceUrl(DOMAIN_CONSTANTS.SERVICE_SUBDOMAINS.RADARR)
    );
  }

  /**
   * Get Sonarr public URL
   */
  getSonarrPublicUrl(): string {
    return (
      process.env.SONARR_PUBLIC_URL ||
      this.buildServiceUrl(DOMAIN_CONSTANTS.SERVICE_SUBDOMAINS.SONARR)
    );
  }

  /**
   * Get service public URL by service name
   */
  getServicePublicUrl(serviceName: string): string {
    switch (serviceName) {
      case SERVICES_CONSTANTS.SERVICES.JELLYFIN:
        return this.getJellyfinPublicUrl();
      case SERVICES_CONSTANTS.SERVICES.RADARR:
        return this.getRadarrPublicUrl();
      case SERVICES_CONSTANTS.SERVICES.SONARR:
        return this.getSonarrPublicUrl();
      case SERVICES_CONSTANTS.SERVICES.HOARDER:
        return (
          process.env.HOARDER_PUBLIC_URL ||
          this.buildServiceUrl(DOMAIN_CONSTANTS.SERVICE_SUBDOMAINS.HOARDER)
        );
      case SERVICES_CONSTANTS.SERVICES.NEXTCLOUD:
        return (
          process.env.NEXTCLOUD_PUBLIC_URL ||
          this.buildServiceUrl(DOMAIN_CONSTANTS.SERVICE_SUBDOMAINS.NEXTCLOUD)
        );
      case SERVICES_CONSTANTS.SERVICES.VAULTWARDEN:
        return (
          process.env.VAULTWARDEN_PUBLIC_URL ||
          this.buildServiceUrl(
            DOMAIN_CONSTANTS.SERVICE_SUBDOMAINS.VAULTWARDEN,
          )
        );
      case SERVICES_CONSTANTS.SERVICES.KOMGA:
        return (
          process.env.KOMGA_PUBLIC_URL ||
          this.buildServiceUrl(DOMAIN_CONSTANTS.SERVICE_SUBDOMAINS.KOMGA)
        );
      default:
        throw new Error(`Unknown service: ${serviceName}`);
    }
  }

  // ============ Authentication & Security ============
  getPassportSecret(): string {
    const secret = process.env.PASSPORT_SECRET;
    if (!secret) {
      throw new Error('PASSPORT_SECRET environment variable not set');
    }
    return secret;
  }

  getCredentialEncryptionKey(): string {
    const key = process.env.CREDENTIAL_ENCRYPTION_KEY;
    if (!key) {
      throw new Error('CREDENTIAL_ENCRYPTION_KEY environment variable not set');
    }
    return key;
  }

  getSessionCookieMaxAge(): number {
    return Number(process.env.SESSION_COOKIE_MAX_AGE) || 1000 * 60 * 60 * 24; // 24 hours
  }

  getServiceCookieMaxAge(): number {
    return Number(process.env.SERVICE_COOKIE_MAX_AGE) || 1000 * 60 * 60 * 24; // 24 hours
  }

  // ============ External Services - Internal URLs ============
  getJellyfinBaseUrl(): string {
    const url = process.env.JELLYFIN_BASE_URL;
    if (!url) {
      throw new Error('JELLYFIN_BASE_URL environment variable not set');
    }
    return url;
  }

  getRadarrBaseUrl(): string {
    const url = process.env.RADARR_BASE_URL;
    if (!url) {
      throw new Error('RADARR_BASE_URL environment variable not set');
    }
    return url;
  }

  getSonarrBaseUrl(): string {
    const url = process.env.SONARR_BASE_URL;
    if (!url) {
      throw new Error('SONARR_BASE_URL environment variable not set');
    }
    return url;
  }

}
