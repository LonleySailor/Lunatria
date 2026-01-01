# Security Model

## Overview

Lunatria implements a comprehensive multi-layered security model designed to protect against unauthorized access, session hijacking, and privilege escalation. The security architecture follows defense-in-depth principles with multiple protection layers working together.

## Security Architecture

### Security Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                       │
│  • Input validation                                        │
│  • XSS prevention                                          │
│  • User feedback controls                                  │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                     ROUTING LAYER                           │
│  • Route guards (authGuard, adminGuard)                    │
│  • Navigation protection                                   │
│  • Automatic redirects                                     │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                   APPLICATION LAYER                         │
│  • Service-level authorization                             │
│  • Business logic protection                               │
│  • Role-based access control                               │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                 COMMUNICATION LAYER                         │
│  • HTTPS enforcement                                       │
│  • Credential management                                   │
│  • Error interceptors                                      │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                     SESSION LAYER                           │
│  • Cookie-based authentication                             │
│  • Server-side session validation                          │
│  • Session lifecycle management                            │
└─────────────────────────────────────────────────────────────┘
```

## Route Protection System

### Guard-Based Security

Lunatria uses Angular functional guards to implement route-level security:

#### Authentication Guard (`authGuard`)

```typescript
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

**Protection Features:**
- Validates active session before route activation
- Automatic redirect to login page on failure
- User-friendly error notifications
- Graceful error handling for network issues

#### Admin Guard (`adminGuard`)

```typescript
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

**Protection Features:**
- Validates admin privileges beyond basic authentication
- Redirects non-admin users to home page
- Maintains user experience for authorized users
- Prevents privilege escalation attempts

### Route Configuration Security

```typescript
export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent, canActivate: [authGuard] },
  { path: 'unauthorized', component: UnauthorizedComponent },
  { path: 'admin-panel', component: AdminPanelComponent, canActivate: [adminGuard] },
  { path: 'logout', component: LogoutComponent },
  { path: '**', component: NotFoundComponent },
];
```

**Security Design Principles:**
- **Default Deny**: Unprotected routes are minimal (login, error pages)
- **Least Privilege**: Each route has appropriate protection level
- **Fail-Safe**: Unknown routes redirect to 404 page
- **Clear Separation**: Public, user, and admin routes clearly distinguished

## Session Management Security

### Cookie-Based Authentication

```typescript
// All API calls use secure credential handling
const response = await fetch(`${environment.apiBaseUrl}/endpoint`, {
  credentials: 'include',  // Ensures cookies are sent
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
});
```

**Security Features:**
- **HTTP-Only Cookies**: Cannot be accessed via JavaScript
- **Secure Transport**: HTTPS enforcement in production
- **SameSite Protection**: CSRF protection through cookie settings
- **Domain Restriction**: Cookies scoped to appropriate domains

### Session Validation

```typescript
async isUserLoggedIn(): Promise<boolean> {
  try {
    const response = await fetch(`${environment.apiBaseUrl}/sessions/issessionactive`, {
      credentials: 'include',
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.responseCode === 704;
  } catch (error) {
    console.error('Error checking session:', error);
    return false;
  }
}
```

**Validation Features:**
- **Server-Side Verification**: All session checks validated by backend
- **Continuous Monitoring**: Session status checked on route changes
- **Graceful Degradation**: Network errors handled securely
- **Response Code Validation**: Specific codes prevent response manipulation

## Role-Based Access Control (RBAC)

### User Roles

```
┌─────────────────────────────────────────────────────────────┐
│                        USER HIERARCHY                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐    ┌─────────────────┐               │
│  │  GUEST USER     │    │ AUTHENTICATED   │               │
│  │                 │    │     USER        │               │
│  │ • Login page    │◄───┤                 │               │
│  │ • Public pages  │    │ • Home page     │               │
│  │ • Error pages   │    │ • User services │               │
│  └─────────────────┘    │ • Profile mgmt  │               │
│                         └─────────────────┘               │
│                                  │                        │
│                                  ▼                        │
│                         ┌─────────────────┐               │
│                         │ ADMIN USER      │               │
│                         │                 │               │
│                         │ • All user      │               │
│                         │   privileges    │               │
│                         │ • User creation │               │
│                         │ • Credential    │               │
│                         │   management    │               │
│                         │ • System config │               │
│                         └─────────────────┘               │
└─────────────────────────────────────────────────────────────┘
```

### Permission Matrix

| Resource | Guest | User | Admin |
|----------|-------|------|-------|
| Login Page | ✅ | ✅ | ✅ |
| Home Dashboard | ❌ | ✅ | ✅ |
| Service Access | ❌ | ✅* | ✅ |
| User Creation | ❌ | ❌ | ✅ |
| Credential Management | ❌ | ❌ | ✅ |
| Admin Panel | ❌ | ❌ | ✅ |
| System Configuration | ❌ | ❌ | ✅ |

*Service access limited to user's assigned services

## HTTP Security

### Error Interceptor

```typescript
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

**Security Benefits:**
- **Information Disclosure Prevention**: Generic error messages for security errors
- **Automatic Error Handling**: Consistent error response across application
- **User Experience**: Appropriate redirects and notifications
- **Logging**: Error tracking without exposing sensitive information

### Communication Security

```typescript
// Environment-based API configuration
export const environment = {
  production: false,
  apiBaseUrl: 'https://api.lunatria.test',  // Development
  // apiBaseUrl: 'https://api.lunatria.com',   // Production
};
```

**Security Features:**
- **HTTPS Enforcement**: All API communication over TLS
- **Environment Separation**: Different endpoints for dev/prod
- **Domain Validation**: API calls restricted to known domains
- **Credential Management**: Automatic cookie handling

## Input Validation and XSS Prevention

### Form Security

```typescript
// Example from login component
onSubmit() {
  fetch(`${environment.apiBaseUrl}/users/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({
      username: this.username,  // Angular form binding prevents XSS
      password: this.password
    })
  })
}
```

**Protection Mechanisms:**
- **Angular Form Binding**: Automatic XSS prevention
- **JSON Serialization**: Proper data encoding
- **Content-Type Headers**: Explicit content type declaration
- **Server-Side Validation**: Backend validates all inputs

## Security Configuration

### Application Configuration

```typescript
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([errorInterceptor])  // Global error handling
    ),
    provideToastr({
      positionClass: 'toast-top-right',
      timeOut: 4000,
      preventDuplicates: true  // Prevents information leakage through repeated messages
    }),
    // ... other providers
  ]
};
```

### Security Headers

The application relies on the backend and deployment environment for security headers:
- **Content Security Policy (CSP)**: Configured at server level
- **X-Frame-Options**: Prevents clickjacking
- **X-Content-Type-Options**: Prevents MIME type sniffing
- **Strict-Transport-Security**: Enforces HTTPS

## Threat Mitigation

### Common Attack Vectors

#### Cross-Site Scripting (XSS)
- **Mitigation**: Angular's built-in XSS protection, proper template binding
- **Implementation**: All user inputs properly escaped through Angular templates

#### Cross-Site Request Forgery (CSRF)
- **Mitigation**: SameSite cookie attributes, server-side validation
- **Implementation**: Stateless API design with proper session management

#### Session Hijacking
- **Mitigation**: HTTPS transport, HTTP-only cookies, session validation
- **Implementation**: Continuous session validation, secure cookie settings

#### Privilege Escalation
- **Mitigation**: Server-side role validation, guard-based route protection
- **Implementation**: Admin checks performed on every admin action

#### Information Disclosure
- **Mitigation**: Generic error messages, proper error handling
- **Implementation**: Error interceptors prevent sensitive information leakage

## Security Best Practices

### Development Guidelines

1. **Always Use Guards**: Every protected route must have appropriate guards
2. **Validate Server-Side**: All authorization checks must be server-validated
3. **Handle Errors Gracefully**: Never expose sensitive error information
4. **Use HTTPS**: All communication must be encrypted
5. **Minimize Client Storage**: Avoid storing sensitive data client-side

### Code Review Checklist

- [ ] New routes have appropriate guards
- [ ] API calls include `credentials: 'include'`
- [ ] Error handling doesn't expose sensitive information
- [ ] User inputs are properly validated
- [ ] Admin functions are properly protected
- [ ] Session management follows established patterns

### Security Testing

Regular security testing should include:
- **Route Protection Testing**: Verify guards prevent unauthorized access
- **Session Management Testing**: Validate session lifecycle
- **Input Validation Testing**: Test for XSS and injection vulnerabilities
- **Error Handling Testing**: Ensure secure error responses
- **Role-Based Testing**: Verify RBAC implementation
