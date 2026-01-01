# Component Structure

## Overview

Lunatria follows a well-organized component architecture with clear separation between page components, shared components, and sub-components. All components are implemented as standalone Angular components with explicit imports, following modern Angular 19 patterns.

## Component Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│                      APP COMPONENT                          │
│                    (Root Component)                        │
├─────────────────────────────────────────────────────────────┤
│                    ROUTER OUTLET                            │
└─────────────────────┬───────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┬─────────────┐
        │             │             │             │
        ▼             ▼             ▼             ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│    PAGE     │ │    PAGE     │ │    PAGE     │ │    PAGE     │
│ COMPONENTS  │ │ COMPONENTS  │ │ COMPONENTS  │ │ COMPONENTS  │
├─────────────┤ ├─────────────┤ ├─────────────┤ ├─────────────┤
│ • Login     │ │ • Home      │ │ • Admin     │ │ • Logout    │
│ • NotFound  │ │             │ │   Panel     │ │ • Unauth    │
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

## Page Components

### LoginComponent (`/pages/login/`)

**Purpose**: Handles user authentication and session management

**Key Features**:
- Username/password form handling
- Existing session detection
- Login response handling
- Session continuation option

**Dependencies**:
```typescript
imports: [
  CommonModule,           // Basic Angular directives
  FormsModule,           // Form handling
  BackgroundComponent,   // Shared background
  FooterComponent,       // Shared footer
  TranslateModule        // Internationalization
]
```

**Methods**:
```typescript
class LoginComponent {
  // Properties
  username: string = '';
  password: string = '';
  isSessionActive = false;

  // Core methods
  ngOnInit(): void                           // Initialize session check
  checkSessionStatus(): Promise<void>        // Validate existing session
  continueWithExistingSession(): void        // Use existing session
  onSubmit(): void                          // Handle login form
  logout(): void                            // Logout existing session
}
```

**API Integration**:
- `POST /users/login` - User authentication
- `GET /users/logout` - Session termination
- Session validation through `AuthService`

### HomeComponent (`/pages/home/`)

**Purpose**: Main dashboard for authenticated users

**Key Features**:
- Service status overview
- User dashboard functionality
- Service access buttons
- Quick logout access

**Dependencies**:
```typescript
imports: [
  FooterComponent,         // Shared footer
  BackgroundComponent,     // Shared background
  ButtonsComponent,        // Service buttons
  LogoutButtonComponent    // Quick logout
]
```

**Structure**:
```typescript
class HomeComponent {
  // Simple component focusing on layout composition
  // Business logic handled by child components
}
```

**Protected Route**: Uses `authGuard` for access control

### AdminPanelComponent (`/pages/admin-panel/`)

**Purpose**: Administrative interface for user and credential management

**Key Features**:
- Tabbed interface design
- User creation functionality
- Credential management
- Service assignment

**Dependencies**:
```typescript
imports: [
  FooterComponent,              // Shared footer
  BackgroundComponent,          // Shared background
  NgIf,                        // Conditional rendering
  CommonModule,                // Angular common features
  AdminAddUserComponent,       // User creation sub-component
  AdminAddCredentialsComponent // Credential management sub-component
]
```

**State Management**:
```typescript
class AdminPanelComponent {
  selectedSection: 'add-user' | 'credentials' | 'access' = 'add-user';

  selectSection(section: 'add-user' | 'credentials' | 'access') {
    this.selectedSection = section;
  }
}
```

**Sub-Components**:
- `AdminAddUserComponent` - Handles new user creation
- `AdminAddCredentialsComponent` - Manages service credentials

**Protected Route**: Uses `adminGuard` for admin-only access

### LogoutComponent (`/pages/logout/`)

**Purpose**: Handles user logout process

**Key Features**:
- Clean logout flow
- Session cleanup
- Redirect handling

### NotFoundComponent (`/pages/not-found/`)

**Purpose**: 404 error page for invalid routes

**Key Features**:
- User-friendly error display
- Navigation back to application
- Consistent styling with main app

### UnauthorizedComponent (`/pages/unauthorized/`)

**Purpose**: Displays unauthorized access messages

**Key Features**:
- Clear unauthorized message
- Guidance for proper access
- Navigation options

## Shared Components

### BackgroundComponent (`/components/background/`)

**Purpose**: Provides consistent background styling across all pages

**Key Features**:
- Global background image/styling
- ViewEncapsulation.None for global styles
- Reusable across all page components

**Implementation**:
```typescript
@Component({
  selector: 'app-background',
  standalone: true,
  templateUrl: './background.component.html',
  styleUrls: ['./background.component.css'],
  encapsulation: ViewEncapsulation.None,  // Global styles
})
export class BackgroundComponent {}
```

**Usage Pattern**:
```html
<!-- Included in every page component template -->
<app-background></app-background>
```

### FooterComponent (`/components/footer/`)

**Purpose**: Consistent footer across all pages

**Key Features**:
- Application information
- Links and navigation
- Consistent positioning

**Usage**: Imported and used by all page components

### ButtonsComponent (`/components/buttons/`)

**Purpose**: Service access buttons and controls

**Key Features**:
- Service status indicators
- Quick access to services
- "Check All Services" functionality

**Dependencies**:
```typescript
imports: [TranslateModule]  // For button text localization
```

**Integration**: Used primarily in HomeComponent for dashboard functionality

### LogoutButtonComponent (`/components/logout-button/`)

**Purpose**: Provides logout functionality across the application

**Key Features**:
- Consistent logout behavior
- Integrated with AuthService
- Accessible from multiple locations

**Dependencies**:
```typescript
imports: [TranslateModule]  // For logout button text
```

## Component Design Patterns

### Standalone Component Pattern

All components use the standalone pattern introduced in Angular 15+:

```typescript
@Component({
  selector: 'app-component-name',
  standalone: true,  // Enables standalone functionality
  imports: [
    // Explicit imports required
    CommonModule,
    FormsModule,
    // ... other dependencies
  ],
  templateUrl: './component.html',
  styleUrls: ['./component.css']
})
export class ComponentName { }
```

**Benefits**:
- Explicit dependency management
- Reduced bundle size
- Better tree-shaking
- Improved development experience

### Composition Pattern

Components are composed rather than extended:

```typescript
// Page components compose shared components
@Component({
  imports: [
    BackgroundComponent,  // Shared background
    FooterComponent,      // Shared footer
    // ... specific functionality
  ]
})
```

### Service Injection Pattern

Modern Angular injection patterns are used throughout:

```typescript
// In guards and services
const authService = inject(AuthService);
const router = inject(Router);
const toastr = inject(ToastrService);

// In components (constructor injection still used)
constructor(
  private router: Router,
  private authService: AuthService
) { }
```

## Component Communication

### Parent-Child Communication

```typescript
// Admin panel with sub-components
@Component({
  template: `
    <app-admin-add-user 
      *ngIf="selectedSection === 'add-user'">
    </app-admin-add-user>
    
    <app-admin-add-credentials 
      *ngIf="selectedSection === 'credentials'">
    </app-admin-add-credentials>
  `
})
```

### Service-Based Communication

Components communicate through shared services:

```typescript
// AuthService used across components
class LoginComponent {
  constructor(private authService: AuthService) {}
  
  async checkSession() {
    return await this.authService.isUserLoggedIn();
  }
}
```

## File Organization

```
src/app/
├── components/                 # Shared components
│   ├── background/
│   │   ├── background.component.ts
│   │   ├── background.component.html
│   │   └── background.component.css
│   ├── buttons/
│   ├── footer/
│   └── logout-button/
├── pages/                      # Page components
│   ├── admin-panel/
│   │   ├── admin-panel.component.ts
│   │   ├── admin-panel.component.html
│   │   ├── admin-panel.component.css
│   │   ├── admin-panel.service.ts        # Page-specific service
│   │   ├── admin-add-user/               # Sub-components
│   │   └── admin-add-credentials/
│   ├── home/
│   ├── login/
│   ├── logout/
│   ├── not-found/
│   └── unauthorized/
└── services/                   # Global services
    ├── auth.service.ts
    └── status.service.ts
```

## Best Practices

### Component Development

1. **Single Responsibility**: Each component has one clear purpose
2. **Explicit Imports**: All dependencies explicitly imported
3. **Consistent Naming**: Follow Angular naming conventions
4. **Proper Encapsulation**: Use appropriate view encapsulation strategies

### Template Guidelines

1. **Semantic HTML**: Use proper HTML5 semantic elements
2. **Angular Directives**: Leverage Angular's built-in directives
3. **Accessibility**: Include ARIA attributes where needed
4. **Internationalization**: Use translate pipes for user-facing text

### Styling Approach

1. **Component Scoping**: Most styles scoped to components
2. **Global Styles**: Background component provides global styles
3. **Consistent Classes**: Reusable CSS classes across components
4. **Responsive Design**: Mobile-first responsive implementation

### Testing Considerations

Each component should be testable in isolation:

```typescript
// Component tests should cover
describe('ComponentName', () => {
  // Component initialization
  // User interactions
  // Service integration
  // Error handling
  // Accessibility
});
```
