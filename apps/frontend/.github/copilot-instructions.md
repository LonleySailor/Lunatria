# Lunatria Web Application - AI Coding Agent Instructions

## Project Overview

Lunatria is an Angular 19 dashboard application for managing self-hosted services with user authentication and admin controls. It connects to a backend API for session management, user administration, and service credential storage.

## Documentation Structure

In the `/Frontend-Docs` folder, you will find detailed technical documentation covering:

- **Core Documentation**: Executive summary, system architecture, authentication system, security model
- **Component Documentation**: Component structure, services, guards, and interceptors
- **Implementation Details**: API integration, internationalization, admin panel features
- **Development Guide**: Setup, build, deployment, and best practices
  In /Backend-Docs, you will find the backend API documentation.
  After adding new features or making changes, ensure to update the relevant documentation files to maintain consistency.

## Architecture Patterns

### Authentication System

- **Session-based auth**: Uses cookies with `credentials: 'include'` in fetch calls
- **Dual guards**: `authGuard` for logged-in users, `adminGuard` for admin-only pages
- **Auth service**: `AuthService` handles session validation via `/sessions/issessionactive` endpoint
- **Response codes**: Use constants from [src/app/config/response-codes.const.ts](src/app/config/response-codes.const.ts) (e.g., `RESPONSE_CODES.SESSIONS.SESSION_STATUS_FETCHED_SUCCESSFULLY` for active session, `RESPONSE_CODES.AUTH.USER_LOGGED_IN` for login success)

### API Communication

- **Fetch-based**: Direct `fetch()` calls instead of Angular HttpClient for most auth operations
- **Environment switching**: Development uses `api.lunatria.test`, production uses `api.lunatria.com`
- **Proxy config**: Development proxy routes `/` to `http://lunatria.com`
- **Error handling**: Global HTTP interceptor for 404/500, component-level for auth errors

### Component Structure

- **Standalone components**: All components use standalone: true with explicit imports
- **Page components**: Located in `src/app/pages/`, each represents a route
- **Shared components**: Background, footer, buttons in `src/app/components/`
- **Service injection**: Modern Angular patterns with `inject()` in guards and functional interceptors

### Internationalization

- **ngx-translate**: Custom `TranslateHttpLoader` loads from `/assets/i18n/{lang}.json`
- **Minimal i18n**: Currently supports EN/PL with basic translations
- **Toast integration**: Toastr notifications support translated messages

## Key Development Patterns

### Service Methods

```typescript
// Use fetch with credentials for API calls
import { RESPONSE_CODES } from 'src/app/config/response-codes.const';

async methodName(): Promise<boolean> {
  try {
    const response = await fetch(`${environment.apiBaseUrl}/endpoint`, {
      credentials: 'include',
    });
    const data = await response.json();
    return data.responseCode === RESPONSE_CODES.AUTH.USER_LOGGED_IN; // Use constants, not magic numbers
  } catch (error) {
    console.error('Error description:', error);
    return false;
  }
}
```

**Important**: Always import and use `RESPONSE_CODES` constants instead of hardcoding numeric codes. Available code categories:

- `RESPONSE_CODES.AUTH.*` - Authentication (600s)
- `RESPONSE_CODES.SESSIONS.*` - Sessions (700s)
- `RESPONSE_CODES.CREDENTIALS.*` - Credentials (800s)
- `RESPONSE_CODES.PROFILE.*` - Profile/Settings (900s)

### Route Protection

- Routes use functional guards: `canActivate: [authGuard]` or `canActivate: [adminGuard]`
- Guards automatically redirect and show toastr errors on auth failure
- Admin routes redirect to `/home`, auth routes redirect to `/login`

### Component Development

- Import CommonModule, FormsModule for basic functionality
- Import TranslateModule for i18n support
- Include BackgroundComponent and FooterComponent for consistent layout
- Use ToastrService for user notifications

## Build & Development

### Commands

- `npm start` or `ng serve` - Development server on port 4200
- `npm run build` - Production build with environment file replacement
- `npm test` - Karma unit tests
- Host configuration: Serves on `0.0.0.0:4200` with `lunatria.com:4200` as public host

### File Organization

- **Guards**: `src/app/guards/` - Route protection logic
- **Services**: `src/app/services/` - Business logic and API communication
- **Interceptors**: `src/app/interceptors/` - HTTP error handling
- **Pages**: `src/app/pages/` - Route components with sub-components
- **Environments**: `src/environments/` - API base URL configuration

## Critical Dependencies

- **ngx-toastr**: Toast notifications configured globally with 4s timeout
- **ngx-translate**: Internationalization with custom HTTP loader
- **Angular Router**: Route-based navigation with guards
- **Angular Animations**: Required for toastr functionality

## Admin Features

- Admin panel has tabbed interface for user creation and credential management
- Services use dedicated service classes (e.g., `AdminPanelService`)
- Form data submitted via fetch POST with JSON payloads
- Response handling based on custom API response codes

When working on this codebase, prioritize consistency with the existing fetch-based API pattern, maintain the guard-based security model, and follow the established component structure with shared layout components.
