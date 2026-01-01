# Executive Summary

## What is Lunatria?

Lunatria is a modern Angular 19 dashboard application designed for managing self-hosted services with comprehensive user authentication and administrative controls. It serves as a centralized management interface that connects to a backend API for session management, user administration, and secure credential storage across multiple services.

## Main Purpose

The primary purpose of Lunatria is to provide a unified, secure dashboard for:

- **Service Management**: Centralized control over multiple self-hosted services including Jellyfin, Nextcloud, Radarr, Sonarr, Hoarder, and Vaultwarden
- **User Administration**: Complete user lifecycle management with role-based access control
- **Credential Management**: Secure storage and management of service credentials
- **Session Control**: Robust session-based authentication with administrative oversight

## Key Features

### Authentication & Security
- **Session-based Authentication**: Cookie-based authentication with automatic session validation
- **Role-based Access Control**: Dual-layer security with user and admin access levels
- **Route Protection**: Comprehensive guard-based security preventing unauthorized access
- **Secure API Communication**: All API calls use credentials and proper error handling

### Administrative Capabilities
- **User Creation**: Admin panel for creating new users with service-specific permissions
- **Credential Management**: Secure storage and assignment of service credentials to users
- **Service Configuration**: Management of which services users can access
- **Session Monitoring**: Real-time session validation and management

### User Experience
- **Responsive Design**: Modern Angular interface with consistent styling
- **Internationalization**: Multi-language support (EN/PL) with extensible translation system
- **Toast Notifications**: User-friendly feedback system for all operations
- **Intuitive Navigation**: Clean routing structure with proper error handling

## Technical Highlights

### Modern Angular Architecture
- **Angular 19**: Latest Angular features with standalone components
- **Fetch-based API**: Direct fetch calls for optimized performance
- **Functional Guards**: Modern Angular security patterns
- **Custom Interceptors**: Global error handling and request management

### Development-Friendly
- **Environment Configuration**: Separate development and production configurations
- **Proxy Setup**: Development proxy for seamless local development
- **TypeScript**: Full TypeScript implementation for type safety
- **Component Architecture**: Well-organized component structure with clear separation of concerns

## Target Users

### End Users
- Individuals managing personal self-hosted services
- Small teams requiring centralized service access
- Users who need secure, organized access to multiple applications

### Administrators
- System administrators managing multiple users
- IT teams responsible for service credential management
- Organizations requiring centralized user and service management

## Business Value

Lunatria provides significant value by:

1. **Reducing Complexity**: Single dashboard for multiple services eliminates the need to manage separate login credentials
2. **Enhancing Security**: Centralized authentication and credential management reduces security risks
3. **Improving Efficiency**: Streamlined user and service management saves administrative time
4. **Ensuring Scalability**: Modular architecture allows easy addition of new services and features
5. **Maintaining Control**: Comprehensive admin tools provide full oversight of user access and permissions

## Technical Stack Overview

- **Frontend**: Angular 19 with TypeScript
- **Authentication**: Session-based with cookie management
- **API Communication**: RESTful API with fetch-based requests
- **UI/UX**: ngx-toastr for notifications, ngx-translate for internationalization
- **Security**: Custom guards and interceptors for comprehensive protection
- **Development**: Modern tooling with environment-specific configurations
