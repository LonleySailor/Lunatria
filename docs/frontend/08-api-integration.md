# API Integration

## Overview

Lunatria implements a fetch-based API communication pattern that prioritizes security, reliability, and developer experience. The application uses native JavaScript `fetch` for most operations, with selective use of Angular's HttpClient for specific scenarios requiring RxJS integration.

## API Communication Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND APPLICATION                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐    ┌─────────────────┐               │
│  │   COMPONENTS    │    │    SERVICES     │               │
│  │                 │    │                 │               │
│  │ • User Actions  │◄──►│ • Business      │               │
│  │ • Form Data     │    │   Logic         │               │
│  │ • UI Updates    │    │ • API Calls     │               │
│  └─────────────────┘    └─────────────────┘               │
│                                  │                        │
│                                  ▼                        │
│  ┌─────────────────────────────────────────────────────┐  │
│  │              FETCH API LAYER                        │  │
│  │                                                     │  │
│  │ • credentials: 'include'                            │  │
│  │ • Content-Type: application/json                    │  │
│  │ • Environment-based URLs                            │  │
│  │ • Error handling                                    │  │
│  └─────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      BACKEND API                            │
│                                                             │
│  Development: https://api.lunatria.test                     │
│  Production:  https://api.lunatria.com                      │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ USERS API   │  │SESSION API  │  │  ADMIN API          │  │
│  │             │  │             │  │                     │  │
│  │ /users/*    │  │/sessions/*  │  │ /support/*          │  │
│  │             │  │             │  │ /credentials/*      │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Environment Configuration

### Development vs Production

```typescript
// Development environment (environment.ts)
export const environment = {
  production: false,
  apiBaseUrl: 'https://api.lunatria.test',
};

// Production environment (environment.prod.ts)
export const environment = {
  production: true,
  apiBaseUrl: 'https://api.lunatria.com',
};
```

### Proxy Configuration

Development proxy setup in `proxy.conf.json`:

```json
{
  "/": {
    "target": "http://lunatria.com",
    "secure": true,
    "changeOrigin": true,
    "logLevel": "debug"
  }
}
```

**Benefits**:
- Seamless development experience
- CORS handling for local development
- Production-like URL structure
- SSL certificate management

## Fetch-Based API Pattern

### Central ApiService

Lunatria centralizes API calls through a lightweight `ApiService` wrapper over `fetch` that automatically includes cookies and parses JSON responses.

```typescript
// apps/frontend/src/app/services/api.service.ts
async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${environment.apiBaseUrl}${endpoint}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return await response.json();
}
```

### Constants-Driven Endpoints

All endpoint paths are defined in a single constants file to avoid hardcoding routes in components/services:

```typescript
// apps/frontend/src/app/config/constants.ts
export const API_ENDPOINTS = {
  USERS: { LOGIN: '/users/login', LOGOUT: '/users/logout', REGISTER: '/users/register', PROFILE_PICTURE: '/users/profile-picture' },
  SESSIONS: { IS_ACTIVE: '/sessions/issessionactive', GET_USER_INFO: '/sessions/getuserinfo' },
  SUPPORT: { IS_ADMIN: '/support/is-admin', SERVICES: '/support/services' },
  CREDENTIALS: { ADD: '/credentials/add' },
} as const;
```

### Standard Fetch Implementation

```typescript
// Base pattern used across all services
async apiCall(endpoint: string, options: RequestInit = {}): Promise<any> {
  try {
    const response = await fetch(`${environment.apiBaseUrl}${endpoint}`, {
      credentials: 'include',  // Always include cookies
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API call to ${endpoint} failed:`, error);
    throw error;
  }
}
```

### Authentication API Examples

#### Login Implementation

```typescript
// LoginComponent.onSubmit() using ApiService + constants
onSubmit() {
  this.api.post(API_ENDPOINTS.USERS.LOGIN, {
    username: this.username,
    password: this.password
  })
  .then(data => {
    if (data.responseCode === 609) {
      this.router.navigate(['/home']);
    } else if (data.responseCode === 603) {
      this.toastr.error(this.translate.instant('AUTH.IncorrectPassword'), this.translate.instant('Toast.Error'));
    } else if (data.responseCode === 602) {
      this.toastr.error(this.translate.instant('AUTH.IncorrectUsername'), this.translate.instant('Toast.Error'));
    } else {
      this.toastr.error(this.translate.instant('AUTH.UnknownResponse'), this.translate.instant('Toast.Error'));
    }
  })
  .catch(() => this.toastr.error(this.translate.instant('Toast.Unauthorized'), this.translate.instant('Toast.Error')));
    })
    .catch(error => console.error('Error:', error));
}
```

#### Session Validation

```typescript
// AuthService.isUserLoggedIn()
async isUserLoggedIn(): Promise<boolean> {
  try {
    const response = await fetch(`${environment.apiBaseUrl}/sessions/issessionactive`, {
      credentials: 'include',
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.responseCode === 704;  // Active session code
  } catch (error) {
    console.error('Error checking session:', error);
    return false;
  }
}
```

#### Logout Implementation

```typescript
// AuthService.logout()
logout(): void {
  fetch(`${environment.apiBaseUrl}/users/logout`, {
    method: 'GET',
    credentials: 'include'
  })
    .then(response => response.json())
    .then(data => {
      if (data.statusCode === 200 && data.responseCode === 611) {
        window.location.reload();  // Logout successful
      } else {
        console.log('Logout failed');
      }
    })
    .catch(error => console.error('Logout error:', error));
}
```

### Admin API Examples

#### User Creation

```typescript
// AdminPanelService.createUser()
async createUser(userData: {
  username: string;
  password: string;
  email: string;
  usertype: string;
  allowedServices: string[];
}) {
  return fetch(`${environment.apiBaseUrl}/users/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({
      username: userData.username,
      password: userData.password,
      email: userData.email,
      usertype: userData.usertype,
      allowedServices: userData.allowedServices,
    })
  })
    .then(response => response.json());
}
```

#### Credential Management

```typescript
// AdminPanelService.addCredentials()
async addCredentials(credentialsData: {
  service: string;
  username?: string;
  password: string;
  email?: string;
  targetUser: string;
}) {
  const payload: any = {
    service: credentialsData.service,
    password: credentialsData.password,
    targetUser: credentialsData.targetUser,
  };

  // Conditionally add optional fields
  if (credentialsData.username) {
    payload.username = credentialsData.username;
  }

  if (credentialsData.email) {
    payload.email = credentialsData.email;
  }

  return await fetch(`${environment.apiBaseUrl}/credentials/add`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(payload)
  })
    .then(response => response.json());
}
```

## RxJS Integration for Reactive Scenarios

### StatusService with HttpClient

```typescript
// StatusService uses HttpClient for reactive service monitoring
@Injectable({
  providedIn: 'root'
})
export class StatusService {
  private readonly apiUrl = `${environment.apiBaseUrl}/support/services`;
  private lastKnownStatuses = new BehaviorSubject<Record<ServiceName, boolean>>({
    // Initial state
  });

  constructor(private http: HttpClient) { }

  getAllServiceStatuses(): Observable<Record<ServiceName, boolean>> {
    return this.http.get<Record<ServiceName, boolean>>(this.apiUrl).pipe(
      tap(statuses => {
        this.lastKnownStatuses.next(statuses);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Error fetching service statuses:', error.message);
        return of(this.lastKnownStatuses.value);  // Fallback to cached data
      })
    );
  }
}
```

**When to Use HttpClient vs Fetch**:
- **HttpClient**: For reactive scenarios requiring RxJS operators
- **Fetch**: For simple request/response patterns, especially authentication
- **Consistency**: Most authentication flows use fetch for consistency

## Response Code Patterns

### Authentication Response Codes

| Code | Meaning | Action |
|------|---------|--------|
| 609 | Login successful | Navigate to home |
| 602 | Incorrect username | Show username error |
| 603 | Incorrect password | Show password error |
| 704 | Session active | Allow access |
| 611 | Logout successful | Reload page |

### Implementation Pattern

```typescript
.then(data => {
  switch(data.responseCode) {
    case 609:
      // Handle success
      break;
    case 602:
      // Handle username error
      break;
    case 603:
      // Handle password error
      break;
    default:
      // Handle unknown response
      console.log('Unknown response code:', data.responseCode);
  }
})
```

## Error Handling Strategies

### Network Error Handling

```typescript
// Standard error handling pattern
try {
  const response = await fetch(url, options);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const data = await response.json();
  return data;
} catch (error) {
  console.error('API call failed:', error);
  
  // Component-specific error handling
  if (error instanceof TypeError) {
    // Network error
    this.showNetworkError();
  } else {
    // HTTP error
    this.showHttpError(error.message);
  }
  
  throw error;  // Re-throw for caller handling
}
```

### Graceful Degradation

```typescript
// StatusService fallback pattern
getAllServiceStatuses(): Observable<Record<ServiceName, boolean>> {
  return this.http.get<Record<ServiceName, boolean>>(this.apiUrl).pipe(
    tap(statuses => this.lastKnownStatuses.next(statuses)),
    catchError((error: HttpErrorResponse) => {
      console.error('Error fetching service statuses:', error.message);
      console.log('Returning last known statuses:', this.lastKnownStatuses.value);
      return of(this.lastKnownStatuses.value);  // Graceful fallback
    })
  );
}
```

## Security Implementation

### Credential Management

```typescript
// All API calls include credentials for session management
const response = await fetch(url, {
  credentials: 'include',  // Ensures cookies are sent
  // ... other options
});
```

**Security Features**:
- HTTP-only cookies automatically managed
- HTTPS enforcement in production
- No client-side token storage
- Automatic session validation

### CORS and Content-Type

```typescript
// Standard headers for all POST requests
headers: {
  'Content-Type': 'application/json'
},
credentials: 'include'
```

### Admin Operation Security

```typescript
// Admin operations require both authentication and authorization
async isUserAdmin(): Promise<boolean> {
  try {
    const response = await fetch(`${environment.apiBaseUrl}/support/is-admin`, {
      credentials: 'include',
    }).then(response => response.json());
    
    return response.isAdmin !== false;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;  // Fail-safe default
  }
}
```

## API Endpoint Documentation

### User Management Endpoints

| Method | Endpoint | Purpose | Request Body | Response |
|--------|----------|---------|--------------|----------|
| POST | `/users/login` | User authentication | `{username, password}` | `{responseCode, User?}` |
| GET | `/users/logout` | User logout | None | `{statusCode, responseCode}` |
| POST | `/users/register` | User creation (admin) | `{username, password, email, usertype, allowedServices}` | `{responseCode, ...}` |

### Session Management Endpoints

| Method | Endpoint | Purpose | Request Body | Response |
|--------|----------|---------|--------------|----------|
| GET | `/sessions/issessionactive` | Session validation | None | `{responseCode}` |

### Admin Endpoints

| Method | Endpoint | Purpose | Request Body | Response |
|--------|----------|---------|--------------|----------|
| GET | `/support/is-admin` | Admin check | None | `{isAdmin}` |
| GET | `/support/services` | Service status | None | `{service1: boolean, ...}` |
| POST | `/credentials/add` | Add credentials | `{service, password, targetUser, username?, email?}` | `{responseCode, ...}` |

## Best Practices

### API Call Implementation

1. **Always Include Credentials**: Use `credentials: 'include'` for session management
2. **Environment URLs**: Always use `environment.apiBaseUrl`
3. **Content-Type Headers**: Set appropriate headers for JSON requests
4. **Error Handling**: Implement comprehensive error handling
5. **Response Validation**: Validate response structure and codes

### Performance Optimization

1. **Request Deduplication**: Avoid duplicate simultaneous requests
2. **Caching Strategies**: Implement caching for frequently accessed data
3. **Request Timeout**: Consider implementing request timeouts
4. **Loading States**: Provide user feedback during API calls

### Security Best Practices

1. **No Sensitive Data in URLs**: Use request body for sensitive information
2. **Validate Responses**: Always validate API response structure
3. **Error Message Sanitization**: Don't expose sensitive error information
4. **Fail-Safe Defaults**: Default to secure states on errors

### Testing Considerations

```typescript
// Mock fetch for testing
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ responseCode: 609 }),
  })
);

describe('API Integration', () => {
  it('should handle login success', async () => {
    // Test successful login flow
  });

  it('should handle network errors', async () => {
    // Test network error scenarios
  });

  it('should include credentials in requests', () => {
    // Verify credentials are included
  });
});
```
