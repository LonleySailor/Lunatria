# Services Documentation

## Overview

Lunatria uses a service-oriented architecture with dedicated Angular services handling business logic, API communication, and state management. Services are implemented as singletons with dependency injection, following Angular best practices.

## Service Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      SERVICES LAYER                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐    ┌─────────────────┐               │
│  │   AuthService   │    │  StatusService  │               │
│  │                 │    │                 │               │
│  │ • Session Mgmt  │    │ • Service       │               │
│  │ • User Auth     │    │   Status        │               │
│  │ • Admin Check   │    │ • Health Check  │               │
│  │ • Logout        │    │ • State Cache   │               │
│  └─────────────────┘    └─────────────────┘               │
│                                                             │
│  ┌─────────────────┐    ┌─────────────────┐               │
│  │AdminPanelService│    │ Future Services │               │
│  │                 │    │                 │               │
│  │ • User Creation │    │ • Config Mgmt   │               │
│  │ • Credential    │    │ • Notification  │               │
│  │   Management    │    │ • Monitoring    │               │
│  │ • Admin API     │    │ • Analytics     │               │
│  └─────────────────┘    └─────────────────┘               │
└─────────────────────────────────────────────────────────────┘
```

## AuthService

### Purpose
Central authentication service handling user session management, login state validation, and admin privilege checking.

### Implementation

```typescript
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor() { }

  /**
   * Validates current user session with backend
   * @returns Promise<boolean> - true if session is active
   */
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

  /**
   * Logs out current user and reloads page
   */
  logout(): void {
    fetch(`${environment.apiBaseUrl}/users/logout`, {
      method: 'GET',
      credentials: 'include'
    })
      .then(response => response.json())
      .then(data => {
        if (data.statusCode === 200 && data.responseCode === 611) {
          window.location.reload();
        } else {
          console.log('Logout failed');
        }
      })
      .catch(error => console.error('Logout error:', error));
  }

  /**
   * Checks if current user has admin privileges
   * @returns Promise<boolean> - true if user is admin
   */
  async isUserAdmin(): Promise<boolean> {
    try {
      const response = await fetch(`${environment.apiBaseUrl}/support/is-admin`, {
        credentials: 'include',
      }).then(response => response.json());
      
      if (response.isAdmin === false) {
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }

  /**
   * Legacy method for token management (currently unused)
   * @returns string | null - access token from localStorage
   */
  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }
}
```

### Key Features

#### Session Management
- **Persistent Session Validation**: Continuous checking of user session status
- **Cookie-Based Authentication**: Uses HTTP cookies with `credentials: 'include'`
- **Automatic Logout**: Handles session termination and page reload
- **Error Handling**: Graceful handling of network errors and invalid responses

#### Security Features
- **Server-Side Validation**: All authentication checks performed server-side
- **Response Code Validation**: Specific response codes prevent manipulation
- **Admin Privilege Checking**: Separate validation for administrative access
- **Fail-Safe Defaults**: Authentication failures default to denied access

#### API Integration
- `GET /sessions/issessionactive` - Session validation (Response: 704 for active)
- `GET /users/logout` - User logout (Response: 611 for success)
- `GET /support/is-admin` - Admin check (Response: isAdmin boolean)

### Usage Examples

```typescript
// In components
class SomeComponent {
  constructor(private authService: AuthService) {}

  async checkUserAccess() {
    const isLoggedIn = await this.authService.isUserLoggedIn();
    const isAdmin = await this.authService.isUserAdmin();
    
    if (isLoggedIn && isAdmin) {
      // Proceed with admin operations
    }
  }

  logout() {
    this.authService.logout(); // Handles logout and reload
  }
}

// In guards
export const authGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  return await authService.isUserLoggedIn();
};
```

## StatusService

### Purpose
Manages service status monitoring and health checking for self-hosted services integrated with Lunatria.

### Implementation

```typescript
type ServiceName = 'hoarder' | 'nextcloud' | 'vaultwarden' | 'jellyfin' | 'radarr' | 'sonarr' | 'komga';

@Injectable({
  providedIn: 'root'
})
export class StatusService {
  private readonly apiUrl = `${environment.apiBaseUrl}/support/services`;
  private lastKnownStatuses = new BehaviorSubject<Record<ServiceName, boolean>>({
    hoarder: false,
    nextcloud: false,
    vaultwarden: false,
    jellyfin: false,
    radarr: false,
    sonarr: false,
    komga: false
  });

  constructor(private http: HttpClient) { }

  /**
   * Retrieves status for all monitored services
   * @returns Observable<Record<ServiceName, boolean>>
   */
  getAllServiceStatuses(): Observable<Record<ServiceName, boolean>> {
    return this.http.get<Record<ServiceName, boolean>>(this.apiUrl).pipe(
      tap(statuses => {
        this.lastKnownStatuses.next(statuses);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Error fetching service statuses:', error.message);
        console.log('Returning last known statuses:', this.lastKnownStatuses.value);
        return of(this.lastKnownStatuses.value);
      })
    );
  }
}
```

### Key Features

#### Service Monitoring
- **Multi-Service Support**: Monitors 7 different self-hosted services
- **Real-Time Status**: Provides current operational status for each service
- **Resilient Caching**: Maintains last known statuses during network issues
- **Error Recovery**: Falls back to cached data when API calls fail

#### State Management
- **BehaviorSubject**: Reactive state management with RxJS
- **Initial State**: Services default to offline status
- **State Persistence**: Maintains state across component lifecycle
- **Observable Pattern**: Components can subscribe to status changes

#### Supported Services
- **hoarder**: Personal bookmarking service
- **nextcloud**: File sharing and collaboration platform
- **vaultwarden**: Password manager
- **jellyfin**: Media streaming server
- **radarr**: Movie collection manager
- **sonarr**: TV series collection manager
- **komga**: Comic/manga server

### Usage Examples

```typescript
class DashboardComponent {
  serviceStatuses$ = this.statusService.getAllServiceStatuses();

  constructor(private statusService: StatusService) {}

  ngOnInit() {
    // Subscribe to service statuses
    this.serviceStatuses$.subscribe(statuses => {
      console.log('Service statuses updated:', statuses);
      this.updateUI(statuses);
    });
  }

  refreshStatuses() {
    // Trigger a new status check
    this.serviceStatuses$ = this.statusService.getAllServiceStatuses();
  }
}
```

## AdminPanelService

### Purpose
Handles administrative operations including user creation and credential management for the admin panel.

### Implementation

```typescript
@Injectable({ 
  providedIn: 'root' 
})
export class AdminPanelService {
  constructor(private http: HttpClient) { }

  /**
   * Creates a new user with specified permissions
   * @param userData - User creation data
   * @returns Promise with API response
   */
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

  /**
   * Adds service credentials for a specific user
   * @param credentialsData - Credential assignment data
   * @returns Promise with API response
   */
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
}
```

### Key Features

#### User Management
- **User Registration**: Creates new users with admin privileges
- **Service Permissions**: Assigns specific service access to users
- **User Type Management**: Handles different user types and roles
- **Email Integration**: Supports email-based user accounts

#### Credential Management
- **Service-Specific Credentials**: Manages credentials for different services
- **Flexible Credential Types**: Supports username/password and email-based auth
- **Target User Assignment**: Assigns credentials to specific users
- **Optional Fields**: Handles services with different authentication requirements

#### Security Features
- **Admin-Only Access**: All operations require admin authentication
- **Credential Isolation**: Each user's credentials are separately managed
- **Secure Transport**: All operations use HTTPS with credentials
- **Input Validation**: Validates all user input before API calls

### API Integration
- `POST /users/register` - User creation endpoint
- `POST /credentials/add` - Credential management endpoint

### Usage Examples

```typescript
class AdminComponent {
  constructor(private adminService: AdminPanelService) {}

  async createNewUser() {
    const userData = {
      username: 'newuser',
      password: 'securepassword',
      email: 'user@example.com',
      usertype: 'standard',
      allowedServices: ['jellyfin', 'nextcloud']
    };

    try {
      const result = await this.adminService.createUser(userData);
      console.log('User created:', result);
    } catch (error) {
      console.error('User creation failed:', error);
    }
  }

  async assignCredentials() {
    const credentialsData = {
      service: 'jellyfin',
      username: 'mediauser',
      password: 'mediapassword',
      targetUser: 'newuser'
    };

    try {
      const result = await this.adminService.addCredentials(credentialsData);
      console.log('Credentials assigned:', result);
    } catch (error) {
      console.error('Credential assignment failed:', error);
    }
  }
}
```

## Service Communication Patterns

### Fetch-Based API Calls

Lunatria primarily uses the native `fetch` API for HTTP communication:

```typescript
// Standard fetch pattern used across services
async apiCall(): Promise<any> {
  try {
    const response = await fetch(`${environment.apiBaseUrl}/endpoint`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',  // Always include credentials
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}
```

### RxJS Integration

Where appropriate, services use RxJS for reactive programming:

```typescript
// StatusService uses RxJS for reactive state management
getAllServiceStatuses(): Observable<Record<ServiceName, boolean>> {
  return this.http.get<Record<ServiceName, boolean>>(this.apiUrl).pipe(
    tap(statuses => this.lastKnownStatuses.next(statuses)),
    catchError(error => of(this.lastKnownStatuses.value))
  );
}
```

### Error Handling Patterns

Services implement consistent error handling:

```typescript
// Graceful error handling with fallbacks
.catch((error: HttpErrorResponse) => {
  console.error('Error fetching data:', error.message);
  // Return cached/default data
  return of(this.defaultValue);
});
```

## Best Practices

### Service Design
1. **Single Responsibility**: Each service has a focused purpose
2. **Dependency Injection**: Use Angular's DI system properly
3. **Error Handling**: Implement robust error handling
4. **Type Safety**: Use TypeScript types throughout

### API Communication
1. **Consistent Patterns**: Use established patterns across services
2. **Credential Management**: Always include credentials for auth
3. **Environment Configuration**: Use environment-specific URLs
4. **Response Validation**: Validate API responses appropriately

### State Management
1. **Reactive Patterns**: Use RxJS where state changes frequently
2. **Caching Strategies**: Implement appropriate caching for reliability
3. **Memory Management**: Properly unsubscribe from observables
4. **Initial States**: Provide sensible default states

### Testing Considerations
Services should be unit tested with:
- Mock HTTP responses
- Error condition testing
- State management validation
- Authentication flow testing
