# System Architecture

## High-Level Architecture Overview

Lunatria follows a modern Angular single-page application (SPA) architecture with a clear separation between frontend presentation and backend API services. The application is designed with security-first principles and modular component organization.

```
┌─────────────────────────────────────────────────────────────┐
│                    LUNATRIA FRONTEND                        │
│                   (Angular 19 SPA)                         │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   PAGES     │  │ COMPONENTS  │  │      SERVICES       │  │
│  │             │  │             │  │                     │  │
│  │ • Login     │  │ • Background│  │ • AuthService       │  │
│  │ • Home      │  │ • Footer    │  │ • StatusService     │  │
│  │ • Admin     │  │ • Buttons   │  │ • AdminPanelService │  │
│  │ • Logout    │  │ • Logout    │  │                     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   GUARDS    │  │INTERCEPTORS │  │      ROUTING        │  │
│  │             │  │             │  │                     │  │
│  │ • authGuard │  │ • HTTP Error│  │ • Route Protection  │  │
│  │ • adminGuard│  │   Handler   │  │ • Navigation Guards │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                    API COMMUNICATION                        │
│          (Fetch-based with Credentials: 'include')         │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     BACKEND API                             │
│                                                             │
│  Development: https://api.lunatria.test                     │
│  Production:  https://api.lunatria.com                      │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   USERS     │  │  SESSIONS   │  │    CREDENTIALS      │  │
│  │             │  │             │  │                     │  │
│  │ • Login     │  │ • Validate  │  │ • Service Creds     │  │
│  │ • Register  │  │ • Create    │  │ • User Assignment   │  │
│  │ • Admin     │  │ • Destroy   │  │ • Secure Storage    │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Component Relationship Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        APP COMPONENT                        │
│                     (Root Component)                       │
├─────────────────────────────────────────────────────────────┤
│                      ROUTER OUTLET                         │
└─────────────────────┬───────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┬─────────────┐
        │             │             │             │
        ▼             ▼             ▼             ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│   LOGIN     │ │    HOME     │ │ ADMIN PANEL │ │   LOGOUT    │
│ COMPONENT   │ │ COMPONENT   │ │ COMPONENT   │ │ COMPONENT   │
├─────────────┤ ├─────────────┤ ├─────────────┤ ├─────────────┤
│ • Username  │ │ • Services  │ │ • User Mgmt │ │ • Session   │
│ • Password  │ │ • Dashboard │ │ • Cred Mgmt │ │   Cleanup   │
│ • Session   │ │ • Status    │ │ • Admin UI  │ │             │
│   Check     │ │   Display   │ │             │ │             │
└─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
        │             │             │             │
        └─────────────┼─────────────┼─────────────┘
                      │             │
              ┌───────▼─────────────▼───────┐
              │     SHARED COMPONENTS      │
              ├────────────────────────────┤
              │ • BackgroundComponent      │
              │ • FooterComponent          │
              │ • ButtonsComponent         │
              │ • LogoutButtonComponent    │
              └────────────────────────────┘
```

## Service Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       SERVICES LAYER                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐    ┌─────────────────┐               │
│  │   AuthService   │    │  StatusService  │               │
│  │                 │    │                 │               │
│  │ • Session Check │    │ • Service       │               │
│  │ • Login State   │    │   Status        │               │
│  │ • Admin Check   │    │ • Health        │               │
│  │ • Logout        │    │   Monitoring    │               │
│  └─────────────────┘    └─────────────────┘               │
│                                                             │
│  ┌─────────────────┐    ┌─────────────────┐               │
│  │AdminPanelService│    │ Future Services │               │
│  │                 │    │                 │               │
│  │ • User Creation │    │ • Service Mgmt  │               │
│  │ • Credential    │    │ • Config Mgmt   │               │
│  │   Management    │    │ • Monitoring    │               │
│  └─────────────────┘    └─────────────────┘               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      API ENDPOINTS                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Authentication:              Admin Functions:              │
│  • POST /users/login         • POST /users/register         │
│  • GET  /users/logout        • POST /credentials/add        │
│  • GET  /sessions/active     • GET  /support/is-admin       │
│                                                             │
│  Service Management:          Future Endpoints:             │
│  • GET  /services/status     • GET  /services/health        │
│  • POST /services/config     • PUT  /users/permissions      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Layer 1: Route Protection                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  authGuard: Protects user routes                   │   │
│  │  adminGuard: Protects admin routes                 │   │
│  │  • Session validation before route activation     │   │
│  │  • Automatic redirects on auth failure             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Layer 2: HTTP Communication                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  • credentials: 'include' on all API calls         │   │
│  │  • HTTPS enforcement                                │   │
│  │  • Error interceptors for global error handling    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Layer 3: Session Management                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  • Cookie-based sessions                            │   │
│  │  • Server-side session validation                  │   │
│  │  • Automatic session cleanup on logout             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Layer 4: Role-Based Access                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  • User role validation                             │   │
│  │  • Admin privilege checks                           │   │
│  │  • Service-specific permissions                     │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      USER INTERACTION                       │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                  COMPONENT LAYER                            │
│  • Handles user input                                      │
│  • Manages local state                                     │
│  • Triggers service calls                                  │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                   GUARD LAYER                               │
│  • Validates permissions                                   │
│  • Checks session status                                   │
│  • Redirects if unauthorized                               │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                  SERVICE LAYER                              │
│  • Business logic                                          │
│  • API communication                                       │
│  • Data transformation                                     │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                INTERCEPTOR LAYER                            │
│  • Global error handling                                   │
│  • Request/response transformation                         │
│  • Logging and monitoring                                  │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND API                              │
│  • Session validation                                      │
│  • Data persistence                                        │
│  • Business rules enforcement                              │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                  RESPONSE HANDLING                          │
│  • Toast notifications                                     │
│  • UI updates                                              │
│  • Navigation changes                                      │
└─────────────────────────────────────────────────────────────┘
```

## Environment Configuration

The application supports environment-specific configurations:

### Development Environment
- **API Base URL**: `https://api.lunatria.test`
- **Proxy Configuration**: Routes `/` to `http://lunatria.com`
- **Development Server**: `0.0.0.0:4200`
- **Public Host**: `lunatria.com:4200`

### Production Environment
- **API Base URL**: `https://api.lunatria.com`
- **Optimized Build**: Tree-shaking and minification enabled
- **Production Guards**: Enhanced security configurations

## Technology Stack Integration

The architecture seamlessly integrates:

- **Angular 19**: Modern framework with standalone components
- **TypeScript**: Type safety throughout the application
- **ngx-toastr**: Global notification system
- **ngx-translate**: Internationalization support
- **RxJS**: Reactive programming for async operations
- **Angular Router**: SPA navigation with guard protection
