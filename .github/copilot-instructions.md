# Lunatria - AI Coding Agent Instructions

Lunatria is a **monorepo** for a self-hosted media service SSO gateway: NestJS backend + Angular 19 frontend.

## Project Structure

- **apps/backend**: NestJS auth proxy (`lunatria-server`) → MongoDB + Redis → Jellyfin/Radarr/Sonarr
- **apps/frontend**: Angular 19 dashboard for admin & user management
- **docs/**: Detailed technical documentation per module
- **infra/nginx**: Nginx configs for subdomain routing

## Architecture Essentials

### System Flow

```
User Login → Frontend (fetch to /login) → Backend validates Passport.js
  → Redis session stored → User granted access to allowed services
  → Proxy controllers route requests to Jellyfin/Radarr/Sonarr
```

### Key Design Principles

1. **Constants-Driven**: Never hardcode routes—import from `src/config/constants/`
2. **Centralized Config**: `ConfigService` reads env vars and builds URLs dynamically
3. **Session + Encryption**: Express sessions in Redis + AES-256-CBC for stored credentials
4. **Role-Based Access**: `admin` / `user` roles, service-specific `allowedServices[]` array
5. **Structured Errors**: All errors thrown via `createCustomException()` with semantic response codes (6xx, 7xx, 8xx ranges)

---

## Backend (NestJS)

When working on backend code, refer to [apps/backend/.github/copilot-instructions.md](apps/backend/.github/copilot-instructions.md).

**Key Files**: [apps/backend/src](apps/backend/src)

### Constants Pattern

All routes/service names live in `src/config/constants/`:

```typescript
// DON'T: router.get('/users')
// DO:
import { AUTH_CONSTANTS, SERVICES_CONSTANTS } from 'src/config/constants';

@Controller(AUTH_CONSTANTS.CONTROLLERS.USERS)
@Get(AUTH_CONSTANTS.ENDPOINTS.LOGIN)
```

### Service Access Guard

Controllers proxying external services use decorator + guard:

```typescript
@Service(SERVICES_CONSTANTS.SERVICES.JELLYFIN)
@UseGuards(ServiceAccessGuard)
async proxy(@Req() req, @Res() res) { /* ... */ }
```

`ServiceAccessGuard` checks: session exists → user loaded → `allowedServices` includes service (or admin bypasses).  
Files: [src/auth/guards/service.access.guard.ts](apps/backend/src/auth/guards/service.access.guard.ts), [src/auth/decorators/service.decorator.ts](apps/backend/src/auth/decorators/service.decorator.ts)

### Credential Encryption

- **Never** store/access credentials directly—always use `CredentialsService`
- Stores encrypted (`iv:ciphertext` hex) in MongoDB via AES-256-CBC
- Environment key: `CREDENTIAL_ENCRYPTION_KEY` (32 chars)
- Redis cache: `{service}:token:{userId}` for service-specific tokens
- See: [src/credentials/credentials.service.ts](apps/backend/src/credentials/credentials.service.ts)

### Error Handling

```typescript
// DO: Use response utils
import {
  throwException,
  throwSessionException,
} from "src/responseStatus/response.utils";

throwException.Usernotfound();
// Returns: { statusCode: 404, responseCode: 610 }
```

Response codes: 600s (auth), 700s (sessions), 800s (credentials).  
Reference: [docs/backend/response-codes.md](docs/backend/response-codes.md)

### Session Management

- Express sessions in Redis: `sess:{sessionId}`
- User tracking: `user:{userId}` sets of active sessionIds
- Middleware globally applied via [src/sessions/sessions.middleware.ts](apps/backend/src/sessions/sessions.middleware.ts)
- Session serializer ([src/sessions/session.serializer.ts](apps/backend/src/sessions/session.serializer.ts)): stores only `userId` in passport session
- Domain cookies (`sameSite: 'none'`) enable cross-subdomain SSO

### Environment Variables

**Required** (see [.env.example](apps/backend/.env.example)):

- `MONGODB_URI`, `REDIS_URL`, `DOMAIN_NAME`, `PASSPORT_SECRET`, `CREDENTIAL_ENCRYPTION_KEY`
- Service URLs: `JELLYFIN_BASE_URL`, `RADARR_BASE_URL`, `SONARR_BASE_URL` (internal)

**Public URLs** auto-built: `{PROTOCOL}://{subdomain}.{DOMAIN}` unless overridden (e.g., `JELLYFIN_PUBLIC_URL`).

### Development Workflow

```bash
# Start containers (MongoDB :27018, Redis :6380)
docker-compose up -d

# Development with watch
npm run start:dev

# Create admin user
npx ts-node scripts/create-admin.ts

# Build copies public/ to dist/public/
npm run build
```

### Modules Overview

- **auth**: Passport.js local strategy, session handling
- **users**: User CRUD, password reset, role management
- **credentials**: Encrypt/decrypt/cache service credentials
- **proxy**: Controllers for Jellyfin/Radarr/Sonarr proxying
- **sessions**: Redis session tracking and invalidation
- **audit**: Logging of service interactions
- **support**: Support tickets (if enabled)

---

## Frontend (Angular 19)

**Key Files**: [apps/frontend/src](apps/frontend/src)

### Session & Auth Pattern

- **Session check**: Fetch to `/sessions/issessionactive` (response code `704` = active)
- **Guards**: `authGuard` (redirect `/login`), `adminGuard` (redirect `/home`)
- **Auth service**: [src/app/services/auth.service.ts](apps/frontend/src/app/services/auth.service.ts)—validates session via fetch, NOT HttpClient
- **Credentials**: `credentials: 'include'` in all fetch calls for cookies

### API Communication

- **Fetch-based** (not HttpClient) for auth operations
- Environment: Dev uses `api.lunatria.test`, prod uses `api.lunatria.com`
- Proxy config routes `/` → `http://lunatria.com` in dev
- Response codes: 609 (login success), 704 (session active), 702 (not found)

### Component Architecture

- **Standalone**: All components use `standalone: true`
- **Page components**: [src/app/pages/](apps/frontend/src/app/pages/) (one per route)
- **Shared**: Background, footer, buttons in [src/app/components/](apps/frontend/src/app/components/)
- **Guards**: Functional guards with `inject()` pattern

### Internationalization (i18n)

- **ngx-translate**: Custom `TranslateHttpLoader` loads from `assets/i18n/{lang}.json`
- **Minimal scope**: EN/PL currently; add translations to JSON files, not hardcoded
- **Toastr support**: Notifications can display translated messages

### Service Development Template

```typescript
// Use fetch with credentials for API calls
async methodName(): Promise<boolean> {
  try {
    const response = await fetch(`${environment.apiBaseUrl}/endpoint`, {
      credentials: 'include',
    });
    const data = await response.json();
    return data.responseCode === EXPECTED_CODE;
  } catch (error) {
    console.error('Error:', error);
    return false;
  }
}
```

### Component Development Template

```typescript
import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TranslateModule } from "@ngx-translate/core";
import { BackgroundComponent } from "../../components/background/background.component";
import { FooterComponent } from "../../components/footer/footer.component";

@Component({
  selector: "app-page-name",
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    BackgroundComponent,
    FooterComponent,
  ],
  templateUrl: "./page-name.component.html",
  styleUrls: ["./page-name.component.css"],
})
export class PageNameComponent {
  private authService = inject(AuthService);
}
```

### Admin Features

- Tab-based interface for user/credential management
- `AdminPanelService`: Form submissions via fetch POST with JSON
- Response handling by custom API codes

### Build & Development

```bash
npm start           # Dev server on :4200
npm run build       # Production build
npm test            # Karma unit tests
ng serve --host 0.0.0.0  # Public host
```

---

## Cross-App Communication

### Frontend → Backend

1. Frontend authenticates → Backend validates passport session + Redis
2. User object returned with `allowedServices` array
3. Frontend caches user state; guards check `allowedServices` before rendering

### Backend → External Services

1. Session middleware loads user from MongoDB
2. Proxy controller validates service access via guard
3. Credentials fetched from MongoDB (decrypted), cached in Redis
4. HTTP request proxied to internal service URL, response returned

### Error Flow

Backend throws structured exception → HTTP response code (401/404/409) + response code → Frontend guard/service catches, displays toastr

---

## Development Workflows

### Adding a New Service Proxy (e.g., Hoarder)

1. Add constants: `SERVICES_CONSTANTS.SERVICES.HOARDER`, `SERVICE_SUBDOMAINS.HOARDER`
2. Create controller: [src/proxy/hoarder/hoarder.controller.ts](apps/backend/src/proxy/hoarder/hoarder.controller.ts) with `@Service` + `ServiceAccessGuard`
3. Add credentials endpoint: [src/credentials/credentials.controller.ts](apps/backend/src/credentials/credentials.controller.ts)
4. Env vars: `HOARDER_BASE_URL`, optional `HOARDER_PUBLIC_URL`
5. Update docs: [docs/backend/modules/proxy.md](docs/backend/modules/proxy.md)

### Adding a New User Endpoint

1. Use constants for controller paths
2. Validate session via middleware (automatic)
3. Load user from MongoDB via `UsersService`
4. Throw exceptions via `response.utils.ts` (e.g., `throwException.Usernotfound()`)
5. Return structured response: `{ statusCode, responseCode, ...data }`

### Running Tests

```bash
# Backend
npm run test --workspace=apps/backend
npm run test:watch --workspace=apps/backend

# Frontend
npm test --workspace=apps/frontend
```

### Debugging

- **Backend**: `npm run start:debug --workspace=apps/backend` (inspect-brk on :9229)
- **Frontend**: Chrome DevTools when `ng serve` running

---

## Critical Gotchas

1. **Credentials**: Use `CredentialsService` only; never read/write MongoDB directly
2. **Constants**: Import from `src/config/constants/`; don't hardcode paths
3. **Session**: Passport stores only `userId`; load full user via `UsersService` when needed
4. **Encryption Key**: Must be exactly 32 chars; change breaks all stored credentials
5. **Domain Cookies**: Requires `sameSite: 'none'` + HTTPS for cross-subdomain SSO
6. **Response Codes**: Always use semantic codes (6xx/7xx/8xx); HTTP status alone insufficient for frontend
7. **Environment**: Separate internal (`*_BASE_URL`) from public (`*_PUBLIC_URL`) service URLs

---

## Documentation Reference

- **Backend API**: [docs/backend/Api_Overview.md](docs/backend/Api_Overview.md)
- **Response Codes**: [docs/backend/response-codes.md](docs/backend/response-codes.md)
- **Environment Setup**: [docs/backend/environment.md](docs/backend/environment.md)
- **Module Docs**: [docs/backend/modules/](docs/backend/modules/)
- **Frontend Architecture**: [docs/frontend/02-system-architecture.md](docs/frontend/02-system-architecture.md)
- **Frontend Auth**: [docs/frontend/03-authentication-system.md](docs/frontend/03-authentication-system.md)

---

## Useful Commands

```bash
# Monorepo
npm install
npm run start:backend
npm run start:frontend
npm run build:backend
npm run build:frontend

# Backend only
npm run lint --workspace=apps/backend
npm run format --workspace=apps/backend
npx ts-node apps/backend/scripts/migration-runner.ts
npx ts-node apps/backend/scripts/create-admin.ts

# Docker
docker-compose -f apps/backend/docker-compose.yml up -d
```
