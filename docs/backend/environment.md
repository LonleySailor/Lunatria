# Environment Configuration

This document lists required and optional environment variables used by the backend. The runtime reads configuration via the `ConfigService` in [apps/backend/src/config/config.service.ts](../../apps/backend/src/config/config.service.ts).

## Required
- `MONGODB_URI`: Full MongoDB connection string (e.g., `mongodb://user:pass@host:27017/db`).
- `REDIS_URL`: Redis connection URL (default `redis://127.0.0.1:6380` if not set, recommended to set explicitly).
- `PASSPORT_SECRET`: 32-byte secret for session signing (hex string recommended).
- `CREDENTIAL_ENCRYPTION_KEY`: Key used for credential encryption at rest.
- `DOMAIN_NAME` (or `DOMAIN`): Root domain (e.g., `lunatria.com`) used for cookies and public URLs.
- `JELLYFIN_BASE_URL`: Internal/network URL for Jellyfin (e.g., `http://jellyfin:8096`).
- `RADARR_BASE_URL`: Internal/network URL for Radarr.
- `SONARR_BASE_URL`: Internal/network URL for Sonarr.

## Optional
- `PORT`: App port (default `3000`).
- `NODE_ENV`: `development` or `production`.
- `CORS_PROTOCOL`: `https` (default) or `http`.
- `SESSION_COOKIE_MAX_AGE`: Milliseconds, default `86400000` (24h).
- `SERVICE_COOKIE_MAX_AGE`: Milliseconds, default `86400000` (24h).
- Public URLs (override auto-built `https://<sub>.<DOMAIN_NAME>`):
  - `JELLYFIN_PUBLIC_URL`
  - `RADARR_PUBLIC_URL`
  - `SONARR_PUBLIC_URL`
  - `HOARDER_PUBLIC_URL`, `NEXTCLOUD_PUBLIC_URL`, `VAULTWARDEN_PUBLIC_URL`, `KOMGA_PUBLIC_URL`

## Example `.env`
```
# Core
NODE_ENV=development
PORT=3000

# Database
MONGODB_URI=mongodb://localhost:27017/nest

# Redis
REDIS_URL=redis://127.0.0.1:6380

# Security
PASSPORT_SECRET=your-64-hex-byte-secret
CREDENTIAL_ENCRYPTION_KEY=your-32-byte-key

# Domain
DOMAIN_NAME=lunatria.com
CORS_PROTOCOL=https

# Internal service URLs
JELLYFIN_BASE_URL=http://192.168.33.36:8096
RADARR_BASE_URL=http://192.168.33.36:7878
SONARR_BASE_URL=http://192.168.33.36:8989

# Optional public URLs (override domain-based defaults)
# JELLYFIN_PUBLIC_URL=https://jellyfin.lunatria.com
# RADARR_PUBLIC_URL=https://radarr.lunatria.com
# SONARR_PUBLIC_URL=https://sonarr.lunatria.com

# Cookie ages (ms)
# SESSION_COOKIE_MAX_AGE=86400000
# SERVICE_COOKIE_MAX_AGE=86400000
```

Notes:
- The application code uses `MONGODB_URI` (not `MONGO_HOST/PORT/DB`) — prefer a single URI.
- Either `DOMAIN_NAME` or `DOMAIN` is accepted; `DOMAIN_NAME` is recommended.
- For Docker, set internal `*_BASE_URL` to service names on the bridge network.
