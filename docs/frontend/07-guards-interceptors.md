# Guards and Interceptors

## Overview

Lunatria implements a comprehensive security and error handling system through Angular guards and HTTP interceptors. These provide route protection, automatic error handling, and consistent user experience across the application.

## Guard System

### Authentication Guard (`authGuard`)

#### Purpose
Protects routes that require user authentication, ensuring only logged-in users can access protected areas of the application.

#### Implementation

```typescript
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastrService } from 'ngx-toastr';

export const authGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastr = inject(ToastrService);

  try {
    const loggedIn = await authService.isUserLoggedIn();
    if (!loggedIn) {
      toastr.error('You must be logged in to access this page.', 'Unauthorized');
      router.navigate(['/login']);
    }
    return loggedIn;
  } catch (err) {
    toastr.error('You must be logged in to access this page.', 'Unauthorized');
    router.navigate(['/login']);
    return false;
  }
};
```

#### Key Features

**Functional Guard Pattern**:
- Uses modern Angular functional guards (introduced in Angular 14+)
- Dependency injection with `inject()` function
- Async operation support for server-side validation

**Security Validation**:
- Server-side session validation via `AuthService.isUserLoggedIn()`
- Response code validation (704 for active session)
- Network error handling with fail-safe defaults

**User Experience**:
- Clear error messages via toast notifications
- Automatic redirect to login page
- Graceful handling of network failures

**Error Handling**:
- Try-catch blocks for network errors
- Consistent error responses
- Fallback behavior for edge cases

#### Usage in Routes

```typescript
// Route configuration with authGuard
export const routes: Routes = [
  { path: 'home', component: HomeComponent, canActivate: [authGuard] },
  // ... other protected routes
];
```

#### Flow Diagram

```mermaid
graph TD
    A[User Navigates to Protected Route] --> B[authGuard Activated]
    B --> C[Inject Dependencies]
    C --> D[Call AuthService.isUserLoggedIn()]
    D --> E[Fetch Session Status from API]
    E --> F{Session Valid?}
    F -->|Yes| G[Return true - Allow Access]
    F -->|No| H[Show Error Toast]
    H --> I[Navigate to /login]
    I --> J[Return false - Deny Access]
    E --> K{Network Error?}
    K -->|Yes| L[Show Error Toast]
    L --> M[Navigate to /login]
    M --> N[Return false - Deny Access]
```

### Admin Guard (`adminGuard`)

#### Purpose
Provides additional protection for administrative routes, ensuring only users with admin privileges can access admin-only functionality.

#### Implementation

```typescript
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastrService } from 'ngx-toastr';

export const adminGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastr = inject(ToastrService);

  try {
    const isUserAdmin = await authService.isUserAdmin();
    if (!isUserAdmin) {
      toastr.error('You must be an admin to access this page.', 'Unauthorized');
      router.navigate(['/home']);
    }
    return isUserAdmin;
  } catch (err) {
    toastr.error('You must be logged in to access this page.', 'Unauthorized');
    router.navigate(['/home']);
    return false;
  }
};
```

#### Key Features

**Admin Privilege Validation**:
- Separate validation beyond basic authentication
- Server-side admin status checking
- Boolean response validation (`isAdmin: true/false`)

**Enhanced Security**:
- Two-layer security (authentication + authorization)
- Prevents privilege escalation attempts
- Server-side role validation

**User Experience Differences**:
- Different error message for admin requirement
- Redirects to `/home` instead of `/login` (assumes user is already authenticated)
- Maintains user context while denying access

**Error Handling**:
- Network errors still redirect to `/home`
- Assumes authentication issues should go to login
- Consistent error messaging

#### Usage in Routes

```typescript
// Route configuration with adminGuard
export const routes: Routes = [
  { 
    path: 'admin-panel', 
    component: AdminPanelComponent, 
    canActivate: [adminGuard] 
  },
  // ... other admin routes
];
```

#### Flow Diagram

```mermaid
graph TD
    A[User Navigates to Admin Route] --> B[adminGuard Activated]
    B --> C[Inject Dependencies]
    C --> D[Call AuthService.isUserAdmin()]
    D --> E[Fetch Admin Status from API]
    E --> F{User is Admin?}
    F -->|Yes| G[Return true - Allow Access]
    F -->|No| H[Show Admin Required Error]
    H --> I[Navigate to /home]
    I --> J[Return false - Deny Access]
    E --> K{Network Error?}
    K -->|Yes| L[Show Login Required Error]
    L --> M[Navigate to /home]
    M --> N[Return false - Deny Access]
```

## HTTP Interceptor System

### Error Interceptor (`errorInterceptor`)

#### Purpose
Provides global HTTP error handling, automatically processing common error scenarios and providing consistent user feedback.

#### Implementation

```typescript
import { inject } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptorFn,
  HttpHandlerFn,
  HttpRequest,
  HttpErrorResponse,
} from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const router = inject(Router);
  const toastr = inject(ToastrService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      switch (error.status) {
        case 404:
          router.navigate(['/404']);
          break;

        case 500:
          toastr.error('A server error occurred. Please try again later.', 'Server Error');
          break;

        // 400, 403, 401 — intentionally ignored or handled elsewhere
      }

      return throwError(() => error);
    })
  );
};
```

#### Key Features

**Functional Interceptor Pattern**:
- Uses modern Angular functional interceptors
- Dependency injection with `inject()` function
- RxJS operator-based error handling

**Error Response Handling**:
- **404 Errors**: Automatic navigation to 404 page
- **500 Errors**: User-friendly server error messages
- **Selective Handling**: Ignores 400, 403, 401 for component-level handling

**User Experience**:
- Consistent error messaging across the application
- Automatic navigation for severe errors
- Toast notifications for server errors

**Error Propagation**:
- Re-throws errors after handling for component-level processing
- Maintains error chain for debugging
- Allows component-specific error handling

#### Integration with Application

```typescript
// Application configuration
export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([errorInterceptor])  // Global registration
    ),
    // ... other providers
  ]
};
```

#### Error Handling Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                    ERROR HANDLING FLOW                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  HTTP Request → Backend API                                 │
│        │                                                    │
│        ▼                                                    │
│  ┌─────────────────┐                                       │
│  │ Error Response  │                                       │
│  └─────────────────┘                                       │
│        │                                                    │
│        ▼                                                    │
│  ┌─────────────────┐    ┌─────────────────┐               │
│  │ Error           │    │ Component-Level │               │
│  │ Interceptor     │────┤ Error Handling  │               │
│  │                 │    │                 │               │
│  │ • 404 → Route   │    │ • 401 → Auth    │               │
│  │ • 500 → Toast   │    │ • 403 → Access  │               │
│  │ • Others pass   │    │ • 400 → Validation│             │
│  └─────────────────┘    └─────────────────┘               │
│        │                                                    │
│        ▼                                                    │
│  ┌─────────────────┐                                       │
│  │ User Feedback   │                                       │
│  │ • Navigation    │                                       │
│  │ • Toast Message │                                       │
│  │ • Error Display │                                       │
│  └─────────────────┘                                       │
└─────────────────────────────────────────────────────────────┘
```

## Guard and Interceptor Integration

### Service Integration

Both guards and interceptors integrate seamlessly with the service layer:

```typescript
// Guards use AuthService for validation
const authService = inject(AuthService);
const isLoggedIn = await authService.isUserLoggedIn();

// Interceptors handle HTTP errors from service calls
// Services can focus on business logic while interceptors handle cross-cutting concerns
```

### Toast Integration

Consistent user feedback through toast notifications:

```typescript
// Toast service injection pattern
const toastr = inject(ToastrService);

// Standardized error messages
toastr.error('You must be logged in to access this page.', 'Unauthorized');
toastr.error('A server error occurred. Please try again later.', 'Server Error');
```

### Router Integration

Automatic navigation handling:

```typescript
// Router service injection
const router = inject(Router);

// Context-appropriate redirects
router.navigate(['/login']);  // For authentication failures
router.navigate(['/home']);   // For authorization failures
router.navigate(['/404']);    // For not found errors
```

## Best Practices

### Guard Development

1. **Async Validation**: Always use async patterns for server-side validation
2. **Error Handling**: Implement comprehensive try-catch blocks
3. **User Feedback**: Provide clear, actionable error messages
4. **Fail-Safe Defaults**: Default to denying access on errors
5. **Dependency Injection**: Use modern `inject()` patterns

### Interceptor Development

1. **Selective Handling**: Only handle errors that require global action
2. **Error Propagation**: Always re-throw errors for component handling
3. **User Experience**: Provide immediate feedback for severe errors
4. **Logging**: Include appropriate logging for debugging
5. **Performance**: Keep interceptors lightweight and efficient

### Testing Strategies

#### Guard Testing

```typescript
describe('authGuard', () => {
  it('should allow access for authenticated users', async () => {
    // Mock AuthService.isUserLoggedIn() to return true
    // Execute guard
    // Assert access is granted
  });

  it('should deny access and redirect for unauthenticated users', async () => {
    // Mock AuthService.isUserLoggedIn() to return false
    // Execute guard
    // Assert access is denied and redirect occurs
  });

  it('should handle network errors gracefully', async () => {
    // Mock AuthService to throw error
    // Execute guard
    // Assert access is denied and error is handled
  });
});
```

#### Interceptor Testing

```typescript
describe('errorInterceptor', () => {
  it('should navigate to 404 page on 404 errors', () => {
    // Mock HTTP 404 response
    // Execute interceptor
    // Assert navigation to 404 page
  });

  it('should show toast on 500 errors', () => {
    // Mock HTTP 500 response
    // Execute interceptor
    // Assert toast notification is displayed
  });

  it('should pass through other errors', () => {
    // Mock HTTP 401 response
    // Execute interceptor
    // Assert error is re-thrown without handling
  });
});
```

## Performance Considerations

### Guard Performance

- **Caching**: Consider caching authentication status for rapid guard checks
- **Parallel Checks**: Avoid unnecessary sequential API calls
- **Debouncing**: Implement debouncing for rapid navigation attempts

### Interceptor Performance

- **Minimal Processing**: Keep interceptor logic lightweight
- **Error Filtering**: Only process relevant error statuses
- **Memory Management**: Properly dispose of subscriptions and resources

## Security Considerations

### Guard Security

- **Server-Side Validation**: Never rely on client-side only validation
- **Token Handling**: Securely handle authentication tokens/sessions
- **Error Information**: Avoid exposing sensitive information in error messages

### Interceptor Security

- **Error Sanitization**: Sanitize error messages before displaying
- **Information Disclosure**: Prevent leaking sensitive server information
- **CSRF Protection**: Ensure interceptors don't interfere with CSRF protection
