# Lunatria Technical Documentation

## Overview

Lunatria is a modern Angular 19 dashboard application designed for managing self-hosted services with comprehensive user authentication and administrative controls. This document provides an overview of the system architecture and links to detailed technical documentation.

## What is Lunatria?

Lunatria serves as a centralized management interface that connects to a backend API for session management, user administration, and secure credential storage across multiple self-hosted services including:

- **Jellyfin** - Media streaming server
- **Nextcloud** - File sharing and collaboration platform  
- **Radarr** - Movie collection manager
- **Sonarr** - TV series collection manager
- **Hoarder** - Personal bookmarking service
- **Vaultwarden** - Password manager
- **Komga** - Comic/manga server

## Key Features

- **Session-based Authentication** with cookie management
- **Role-based Access Control** (User/Admin levels)
- **Admin Panel** for user and credential management
- **Service Status Monitoring** for all integrated services
- **Internationalization** (English/Polish support)
- **Responsive Design** with modern Angular architecture

## Documentation Structure

For detailed technical information, please refer to the comprehensive documentation in the `/Frontend-Docs` folder:

### Core Documentation
- **[Executive Summary](./Frontend-Docs/01-executive-summary.md)** - Project overview and main purpose
- **[System Architecture](./Frontend-Docs/02-system-architecture.md)** - High-level architecture and component relationships
- **[Authentication System](./Frontend-Docs/03-authentication-system.md)** - Authentication flow and session management
- **[Security Model](./Frontend-Docs/04-security-model.md)** - Route protection and security implementation

### Component Documentation
- **[Component Structure](./Frontend-Docs/05-component-structure.md)** - Page and shared components overview
- **[Services Documentation](./Frontend-Docs/06-services-documentation.md)** - Business logic and API communication services
- **[Guards and Interceptors](./Frontend-Docs/07-guards-interceptors.md)** - Route protection and HTTP error handling

### Implementation Details
- **[API Integration](./Frontend-Docs/08-api-integration.md)** - API communication patterns and examples
- **[Internationalization](./Frontend-Docs/09-internationalization.md)** - i18n implementation and usage
- **[Admin Panel Features](./Frontend-Docs/10-admin-panel-features.md)** - Admin functionality documentation

### Development Guide
- **[Development Setup](./Frontend-Docs/11-development-setup.md)** - Setup instructions and environment configuration
- **[Build and Deployment](./Frontend-Docs/12-build-deployment.md)** - Build processes and deployment procedures
- **[Best Practices](./Frontend-Docs/13-best-practices.md)** - Development guidelines and coding standards

## Quick Architecture Overview

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
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS/Fetch API
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     BACKEND API                             │
│                                                             │
│  Development: https://api.lunatria.test                     │
│  Production:  https://api.lunatria.com                      │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

- **Frontend Framework**: Angular 19 with TypeScript
- **Authentication**: Session-based with HTTP cookies
- **API Communication**: Fetch API with credential management
- **State Management**: Service-based with RxJS
- **UI Components**: Standalone Angular components
- **Styling**: CSS with component-scoped styles
- **Internationalization**: ngx-translate
- **Notifications**: ngx-toastr
- **Build Tools**: Angular CLI
- **Testing**: Jasmine/Karma

## Getting Started

1. **For New Developers**: Start with [Executive Summary](./Frontend-Docs/01-executive-summary.md) and [System Architecture](./Frontend-Docs/02-system-architecture.md)
2. **For Setup**: Follow [Development Setup](./Frontend-Docs/11-development-setup.md)
3. **For Implementation**: Review [Best Practices](./Frontend-Docs/13-best-practices.md)
4. **For Deployment**: See [Build and Deployment](./Frontend-Docs/12-build-deployment.md)

## Project Information

- **Version**: 0.5.2-beta
- **Angular Version**: 19.2.0
- **Node.js**: 18.x or 20.x recommended
- **Repository**: lunatria (admin-panel branch)
- **Last Updated**: July 2025

For detailed information on any aspect of the system, please refer to the specific documentation files linked above.