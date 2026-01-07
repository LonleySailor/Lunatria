# Lunatria Backend - AI Agent Guide

## Project Overview

NestJS-based authentication & SSO proxy backend (`lunatria-server`) that provides centralized auth for media services (Jellyfin, Radarr, Sonarr). Users log in once, backend manages credentials and proxies authenticated requests to services.

**Key Architecture**: Session-based auth → Redis sessions → MongoDB users/credentials → Service-specific token caching → Proxy controllers

## Core Patterns

### Constants-Driven Configuration

All routes, endpoints, and service names defined in `src/config/constants/`:

- `AUTH_CONSTANTS.CONTROLLERS.USERS` → `'users'` (controller paths)
- `AUTH_CONSTANTS.ENDPOINTS.LOGIN` → `'login'` (route segments)
- `SERVICES_CONSTANTS.SERVICES.JELLYFIN` → `'jellyfin'` (service identifiers)

**Always use constants** - never hardcode strings like `'/users'` or `'jellyfin'`. Import from `src/config/constants/index.ts`.

### Service Access Pattern

Controllers proxying external services use a custom guard + decorator combo:

```typescript
@Controller(SERVICES_CONSTANTS.JELLYFIN.ROUTE)
export class JellyfinController {
  @Service(SERVICES_CONSTANTS.SERVICES.JELLYFIN)  // Sets metadata
  @UseGuards(ServiceAccessGuard)  // Checks user.allowedServices includes 'jellyfin'
  @All('*')
  async proxy(@Req() req, @Res() res) { ... }
}
```

`ServiceAccessGuard` verifies session, loads user, checks `allowedServices` array. Admin users bypass service restrictions. See [service.access.guard.ts](src/auth/guards/service.access.guard.ts), [service.decorator.ts](src/auth/decorators/service.decorator.ts).

### Credential Encryption

External service credentials stored encrypted in MongoDB via `EncryptionService`:

- Uses AES-256-CBC with key from `CREDENTIAL_ENCRYPTION_KEY` env var (must be 32 chars)
- Format: `iv:encrypted` (hex strings)
- Always accessed through [credentials.service.ts](src/credentials/credentials.service.ts): `setCredential()`, `getCredential()`, `deleteCredential()`
- Credentials cached as service tokens in Redis (e.g., `jellyfin:token:userId`)

### Custom Exception Handling

Centralized error throwing via `createCustomException()` in [response.utils.ts](src/responseStatus/response.utils.ts):

```typescript
throwException.Usernotfound(); // Defined in auth.response.ts
throwSessionException.SessionNotFound(); // Defined in sessions.response.ts
```

Returns structured: `{ statusCode, responseCode, ...additionalData }`. Add new exceptions in `responseStatus/` files, not inline.

### Session Management

Sessions stored in Redis using `connect-redis`:

- **Express session**: `sess:${sessionId}` keys (managed by middleware)
- **User session tracking**: `user:${userId}` sets containing active sessionIds
- Middleware in [sessions.middleware.ts](src/sessions/sessions.middleware.ts) applies globally
- Domain-wide cookies (`sameSite: 'none'`) enable cross-subdomain auth

**Important**: Session serializer ([session.serializer.ts](src/sessions/session.serializer.ts)) stores only `userId` in passport session, not full user object.

## Environment Setup

### Required Env Vars

Reference [.env.example](.env.example) for full list. Critical ones:

- `MONGODB_URI` - Full MongoDB connection string
- `REDIS_URL` - Redis connection URL
- `DOMAIN_NAME` - Root domain (e.g., `lunatria.com`) for cookies/CORS
- `PASSPORT_SECRET` - Session signing (32-byte hex)
- `CREDENTIAL_ENCRYPTION_KEY` - Credential encryption (32 chars)
- Service URLs: `JELLYFIN_BASE_URL`, `RADARR_BASE_URL`, etc. (internal URLs)

**URL Pattern**: Public service URLs auto-built as `{PROTOCOL}://{subdomain}.{DOMAIN}` using [config.service.ts](src/config/config.service.ts) `buildServiceUrl()` unless explicitly overridden.

### Development Workflow

```bash
# Start dependencies (MongoDB on :27018, Redis on :6380)
docker-compose up -d

# Development with watch mode
npm run start:dev

# Create admin user (edit scripts/create-admin.ts first)
npx ts-node scripts/create-admin.ts

# Run tests
npm run test          # Unit tests (jest)
npm run test:watch    # Watch mode
```

**Note**: `postbuild` script copies `public/` to `dist/public/` for static HTML files (SSO bridges, logout pages).

## Module Structure

### Auth Flow

1. User POSTs to `/users/login` → `LocalAuthGuard` triggers `LocalStrategy`
2. `AuthService.validateUser()` checks credentials with bcrypt
3. Passport serializes `userId` to session → stored in Redis
4. `SessionsService.saveSession()` adds sessionId to `user:${userId}` set
5. Subsequent requests use `AuthenticatedGuard` or `ServiceAccessGuard`

### Proxy Architecture

Each service has:

- **Controller**: Route handling, guard application ([jellyfin.controller.ts](src/proxy/jellyfin/jellyfin.controller.ts))
- **Service**: Token mgmt, URL building, HTTP proxying ([jellyfin.service.ts](src/proxy/jellyfin/jellyfin.service.ts))
- Tokens cached per-user in Redis with service-specific keys
- `AuditService` logs all auth attempts (success/fail)

### Database Schemas

- **User** ([users.schema.ts](src/users/users.schema.ts)): `username` (unique), `password`, `userType` ('admin'|'user'), `allowedServices: string[]`
- **Credential** ([credentials.schema.ts](src/credentials/credentials.schema.ts)): `userId`, `service`, `encryptedPayload`
- **Audit**: Service access audit trail

## Common Tasks

### Adding a New Service

1. Add service name to `SERVICES_CONSTANTS.SERVICES` in [services.constants.ts](src/config/constants/services.constants.ts)
2. Add route config (`ENDPOINT_AUTH`, `ROUTER_PREFIX`, etc.)
3. Create controller in `src/proxy/{service}/` with `@Service()` + `@UseGuards(ServiceAccessGuard)`
4. Create service for token/auth logic (follow [jellyfin.service.ts](src/proxy/jellyfin/jellyfin.service.ts) pattern)
5. Update `ConfigService` with public/base URL getters
6. Users set credentials via `CredentialsController` endpoints

### Modifying Guards

Guards in `src/auth/guards/`:

- **AuthenticatedGuard**: Checks passport session exists
- **AdminGuard**: Extends auth check with `userType === 'admin'`
- **ServiceAccessGuard**: Checks `allowedServices` array membership
- **LocalAuthGuard**: Passport local strategy trigger

Always inject `SessionsService` for session validation helpers like `sessionErrorChecking()`.

### CORS & Cookies

CORS allows subdomains of `DOMAIN_NAME` (see [main.ts](src/main.ts) origin validation). Cookies set with:

```typescript
cookie: {
  domain: domainName,  // .lunatria.com allows api.lunatria.com, jellyfin.lunatria.com
  sameSite: 'none',
  secure: protocol === 'https'
}
```

**Must set `trust proxy`** for secure cookies behind reverse proxy.

## Testing Conventions

- Test files: `*.spec.ts` co-located with source
- Jest config in [package.json](package.json) (rootDir: `src/`)
- Example: [profile-picture.service.spec.ts](src/users/profile-picture.service.spec.ts)
- Mock services with `@nestjs/testing` utilities

## Known Gotchas

- **Subdomain cookies require exact domain match**: `domain: 'lunatria.com'` (no leading dot in code, express adds it)
- **Redis connection**: IORedis instance injected via `REDIS_CLIENT` token from [redis.module.ts](src/redis/redis.module.ts)
- **Async factory pattern**: ConfigModule/MongooseModule use `useFactory` with injected `ConfigService`
- **Static files**: Served from `dist/public/` (not `src/public/`) - ensure `postbuild` runs
- **Password hashing**: Always use `bcrypt` with `AUTH_CONSTANTS.BCRYPT_ROUNDS` (10)

## Migrations & Scripts

- **Migrations**: `migrations/` directory with TypeScript files (e.g., `add-profile-picture-field.ts`)
- **Migration runner**: `scripts/migration-runner.ts` (not yet automated in package.json)
- **Admin creation**: `scripts/create-admin.ts` - edit inline credentials before running

When adding schema fields, create migration and update schema simultaneously.
