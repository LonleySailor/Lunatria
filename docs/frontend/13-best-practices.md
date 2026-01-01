# Best Practices

## Overview

This document outlines development best practices, coding standards, and architectural guidelines for maintaining and extending the Lunatria Angular application. Following these practices ensures code quality, maintainability, and team consistency.

## Angular Development Best Practices

### Component Architecture

#### Standalone Components

Use Angular's standalone component pattern for all new components:

```typescript
@Component({
  selector: 'app-feature',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    // Explicit imports only
  ],
  templateUrl: './feature.component.html',
  styleUrls: ['./feature.component.css']
})
export class FeatureComponent {
  // Component implementation
}
```

**Benefits**:
- Explicit dependency management
- Better tree-shaking
- Reduced bundle size
- Improved development experience

#### Component Design Principles

1. **Single Responsibility**: Each component should have one clear purpose
2. **Composition over Inheritance**: Favor component composition
3. **Input/Output Pattern**: Use `@Input()` and `@Output()` for component communication
4. **OnPush Change Detection**: Use for performance optimization

```typescript
@Component({
  // ...
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OptimizedComponent {
  @Input() data: any;
  @Output() action = new EventEmitter<any>();
}
```

### Service Design

#### Injectable Services

Use proper service injection patterns:

```typescript
@Injectable({
  providedIn: 'root'  // Singleton service
})
export class GlobalService {
  constructor(private http: HttpClient) {}
}

@Injectable()  // Component-level service
export class FeatureService {
  constructor() {}
}
```

#### Service Responsibilities

1. **Data Management**: Handle API communication and state
2. **Business Logic**: Encapsulate complex business rules
3. **Utility Functions**: Provide reusable functionality
4. **State Management**: Manage application state

```typescript
// Good: Focused service
@Injectable({
  providedIn: 'root'
})
export class UserService {
  private users$ = new BehaviorSubject<User[]>([]);

  getUsers(): Observable<User[]> {
    return this.users$.asObservable();
  }

  async createUser(user: User): Promise<User> {
    // Implementation
  }
}
```

### Template Best Practices

#### Template Syntax

Use Angular's template syntax effectively:

```html
<!-- Good: Semantic HTML with Angular directives -->
<section class="user-list" *ngIf="users$ | async as users">
  <article 
    class="user-card" 
    *ngFor="let user of users; trackBy: trackByUserId"
    [class.active]="user.id === selectedUserId">
    
    <h3>{{ user.name }}</h3>
    <p>{{ user.email }}</p>
    
    <button 
      type="button"
      [disabled]="isLoading"
      (click)="selectUser(user.id)">
      Select User
    </button>
  </article>
</section>

<!-- Good: Async pipe usage -->
<div *ngIf="serviceStatus$ | async as status">
  Status: {{ status.isOnline ? 'Online' : 'Offline' }}
</div>
```

#### Performance Optimization

```typescript
// Implement trackBy functions for ngFor
trackByUserId(index: number, user: User): number {
  return user.id;
}

// Use OnPush change detection
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PerformantComponent {}
```

### TypeScript Best Practices

#### Type Safety

Use strong typing throughout the application:

```typescript
// Define interfaces for data structures
interface User {
  id: number;
  username: string;
  email: string;
  usertype: 'admin' | 'user';
  allowedServices: ServiceName[];
}

// Use enums for constants
enum ResponseCode {
  LOGIN_SUCCESS = 609,
  INCORRECT_USERNAME = 602,
  INCORRECT_PASSWORD = 603,
  SESSION_ACTIVE = 704,
  LOGOUT_SUCCESS = 611
}

// Type function parameters and returns
async function authenticateUser(credentials: LoginCredentials): Promise<AuthResult> {
  // Implementation with typed parameters and return
}
```

#### Utility Types

Leverage TypeScript utility types:

```typescript
// Partial for optional updates
function updateUser(id: number, updates: Partial<User>): Promise<User> {
  // Implementation
}

// Pick for selecting specific properties
type UserSummary = Pick<User, 'id' | 'username' | 'email'>;

// Omit for excluding properties
type CreateUserRequest = Omit<User, 'id'>;
```

## Code Organization

### File Structure

Maintain consistent file organization:

```
src/app/
├── components/           # Shared components
│   ├── component-name/
│   │   ├── component-name.component.ts
│   │   ├── component-name.component.html
│   │   ├── component-name.component.css
│   │   └── component-name.component.spec.ts
├── pages/               # Page components
├── services/            # Application services
├── guards/              # Route guards
├── interceptors/        # HTTP interceptors
├── models/              # TypeScript interfaces/types
├── utils/               # Utility functions
└── constants/           # Application constants
```

### Naming Conventions

Follow Angular naming conventions:

```typescript
// Components: PascalCase with Component suffix
LoginComponent
AdminPanelComponent
UserManagementComponent

// Services: PascalCase with Service suffix
AuthService
UserService
ApiService

// Files: kebab-case
login.component.ts
admin-panel.component.ts
user-management.service.ts

// Variables and functions: camelCase
selectedUser
isLoggedIn
getUserById()

// Constants: UPPER_SNAKE_CASE
const API_BASE_URL = 'https://api.lunatria.com';
const MAX_RETRY_ATTEMPTS = 3;
```

### Module Organization

Use feature-based organization:

```typescript
// Feature module structure
src/app/features/
├── user-management/
│   ├── components/
│   ├── services/
│   ├── models/
│   └── user-management.module.ts
├── admin-panel/
│   ├── components/
│   ├── services/
│   └── admin-panel.module.ts
```

## State Management

### Service-Based State

Use services for state management in small to medium applications:

```typescript
@Injectable({
  providedIn: 'root'
})
export class StateService {
  private state$ = new BehaviorSubject<AppState>(initialState);

  getState(): Observable<AppState> {
    return this.state$.asObservable();
  }

  updateState(updates: Partial<AppState>): void {
    const currentState = this.state$.value;
    this.state$.next({ ...currentState, ...updates });
  }
}
```

### Reactive Patterns

Use RxJS operators effectively:

```typescript
@Injectable({
  providedIn: 'root'
})
export class DataService {
  private refresh$ = new Subject<void>();

  // Reactive data stream
  data$ = this.refresh$.pipe(
    startWith(null),
    switchMap(() => this.http.get<Data[]>('/api/data')),
    catchError(error => {
      console.error('Error loading data:', error);
      return of([]);
    }),
    shareReplay(1)
  );

  refresh(): void {
    this.refresh$.next();
  }
}
```

## Security Best Practices

### Authentication and Authorization

1. **Server-Side Validation**: Always validate on the server
2. **Guard Implementation**: Use guards for route protection
3. **Token Handling**: Secure token storage and management
4. **Session Management**: Proper session lifecycle handling

```typescript
// Secure guard implementation
export const authGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  try {
    const isAuthenticated = await authService.isUserLoggedIn();
    if (!isAuthenticated) {
      router.navigate(['/login']);
      return false;
    }
    return true;
  } catch (error) {
    router.navigate(['/login']);
    return false;
  }
};
```

### Input Validation

Validate all user inputs:

```typescript
// Form validation
createUserForm = this.fb.group({
  username: ['', [Validators.required, Validators.minLength(3)]],
  email: ['', [Validators.required, Validators.email]],
  password: ['', [Validators.required, Validators.minLength(8)]]
});

// Custom validators
function strongPasswordValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (!value) return null;
  
  const hasNumber = /[0-9]/.test(value);
  const hasUpper = /[A-Z]/.test(value);
  const hasLower = /[a-z]/.test(value);
  const hasSpecial = /[#?!@$%^&*-]/.test(value);
  
  const valid = hasNumber && hasUpper && hasLower && hasSpecial;
  return valid ? null : { strongPassword: true };
}
```

### XSS Prevention

Use Angular's built-in XSS protection:

```html
<!-- Good: Angular automatically sanitizes -->
<div>{{ userInput }}</div>

<!-- Avoid: Bypassing sanitization -->
<div [innerHTML]="trustedHtml"></div>

<!-- When necessary, use DomSanitizer -->
<div [innerHTML]="sanitizer.sanitize(SecurityContext.HTML, userContent)"></div>
```

## Performance Best Practices

### Bundle Optimization

1. **Lazy Loading**: Implement lazy loading for feature modules
2. **Tree Shaking**: Remove unused code
3. **Code Splitting**: Split code into logical chunks
4. **Asset Optimization**: Optimize images and other assets

```typescript
// Lazy loading routes
const routes: Routes = [
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule)
  }
];
```

### Runtime Performance

1. **OnPush Change Detection**: Use for frequently updated components
2. **TrackBy Functions**: Implement for ngFor loops
3. **Async Pipe**: Prefer async pipe over manual subscriptions
4. **Memory Leaks**: Properly unsubscribe from observables

```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PerformantComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  ngOnInit() {
    this.dataService.getData()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        // Handle data
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

## Testing Best Practices

### Unit Testing

Write comprehensive unit tests:

```typescript
describe('AuthService', () => {
  let service: AuthService;
  let httpMock: jasmine.SpyObj<HttpClient>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('HttpClient', ['get', 'post']);
    
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: HttpClient, useValue: spy }
      ]
    });
    
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpClient) as jasmine.SpyObj<HttpClient>;
  });

  it('should return true for valid session', async () => {
    httpMock.get.and.returnValue(of({ responseCode: 704 }));
    
    const result = await service.isUserLoggedIn();
    
    expect(result).toBe(true);
    expect(httpMock.get).toHaveBeenCalledWith(
      'https://api.lunatria.test/sessions/issessionactive',
      { credentials: 'include' }
    );
  });
});
```

### Component Testing

Test component behavior:

```typescript
describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    const authSpy = jasmine.createSpyObj('AuthService', ['login']);

    TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: authSpy }
      ]
    });

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  it('should call auth service on form submit', () => {
    component.username = 'testuser';
    component.password = 'testpass';
    
    component.onSubmit();
    
    expect(authService.login).toHaveBeenCalledWith({
      username: 'testuser',
      password: 'testpass'
    });
  });
});
```

### E2E Testing

Implement end-to-end tests for critical flows:

```typescript
// Cypress E2E test
describe('Login Flow', () => {
  it('should login successfully with valid credentials', () => {
    cy.visit('/login');
    
    cy.get('[data-cy=username]').type('admin');
    cy.get('[data-cy=password]').type('password');
    cy.get('[data-cy=login-button]').click();
    
    cy.url().should('include', '/home');
    cy.get('[data-cy=welcome-message]').should('be.visible');
  });
});
```

## Error Handling

### Global Error Handling

Implement global error handling:

```typescript
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: any): void {
    console.error('Global error:', error);
    
    // Send to logging service
    this.loggingService.logError(error);
    
    // Show user-friendly message
    this.notificationService.showError('An unexpected error occurred');
  }
}
```

### API Error Handling

Handle API errors consistently:

```typescript
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed:`, error);
      
      // Transform error for user consumption
      const userMessage = this.getUserFriendlyMessage(error);
      this.notificationService.showError(userMessage);
      
      // Return safe fallback value
      return of(result as T);
    };
  }

  getData(): Observable<Data[]> {
    return this.http.get<Data[]>('/api/data').pipe(
      catchError(this.handleError<Data[]>('getData', []))
    );
  }
}
```

## Accessibility Best Practices

### Semantic HTML

Use proper HTML semantics:

```html
<!-- Good: Semantic structure -->
<main role="main">
  <section aria-labelledby="login-heading">
    <h1 id="login-heading">Login</h1>
    
    <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
      <fieldset>
        <legend>User Credentials</legend>
        
        <label for="username">Username:</label>
        <input 
          id="username"
          type="text"
          formControlName="username"
          [attr.aria-invalid]="usernameControl.invalid"
          [attr.aria-describedby]="usernameControl.invalid ? 'username-error' : null">
        
        <div id="username-error" *ngIf="usernameControl.invalid" role="alert">
          Username is required
        </div>
      </fieldset>
      
      <button type="submit" [disabled]="loginForm.invalid">
        Login
      </button>
    </form>
  </section>
</main>
```

### ARIA Support

Implement ARIA attributes appropriately:

```html
<!-- Loading states -->
<button [attr.aria-busy]="isLoading" [disabled]="isLoading">
  <span *ngIf="isLoading" aria-hidden="true">⏳</span>
  {{ isLoading ? 'Loading...' : 'Submit' }}
</button>

<!-- Live regions for dynamic content -->
<div aria-live="polite" aria-atomic="true">
  {{ statusMessage }}
</div>

<!-- Modal dialogs -->
<div 
  role="dialog" 
  aria-modal="true"
  [attr.aria-labelledby]="modalTitle"
  *ngIf="showModal">
  <!-- Modal content -->
</div>
```

## Documentation Standards

### Code Documentation

Document complex logic and public APIs:

```typescript
/**
 * Validates user session status with the backend
 * @returns Promise resolving to true if session is active
 * @throws NetworkError when API is unreachable
 * @example
 * ```typescript
 * const isLoggedIn = await authService.isUserLoggedIn();
 * if (isLoggedIn) {
 *   // Proceed with authenticated actions
 * }
 * ```
 */
async isUserLoggedIn(): Promise<boolean> {
  // Implementation
}
```

### README Documentation

Maintain comprehensive README files:

```markdown
# Component Name

## Purpose
Brief description of component purpose and functionality.

## Usage
```typescript
// Usage example
<app-component 
  [input]="data" 
  (output)="handleEvent($event)">
</app-component>
```

## API
### Inputs
- `input: DataType` - Description of input

### Outputs  
- `output: EventType` - Description of output

## Examples
Provide usage examples and common scenarios.
```

## Git Workflow

### Commit Messages

Use conventional commit format:

```
feat: add user management functionality
fix: resolve login session timeout issue
docs: update API documentation
style: format code according to style guide
refactor: extract common authentication logic
test: add unit tests for auth service
chore: update dependencies to latest versions
```

### Branch Strategy

Use GitFlow or GitHub Flow:

```bash
# Feature branches
git checkout -b feature/user-management
git checkout -b feature/admin-panel-improvements

# Bug fix branches
git checkout -b fix/login-session-timeout
git checkout -b fix/api-error-handling

# Release branches
git checkout -b release/v0.6.0
```

### Code Review

Implement thorough code review process:

1. **Automated Checks**: Linting, testing, build verification
2. **Manual Review**: Logic, architecture, best practices
3. **Documentation**: Ensure adequate documentation
4. **Security Review**: Check for security vulnerabilities
5. **Performance Review**: Assess performance implications

Following these best practices ensures maintainable, scalable, and robust Angular applications that can grow with project requirements while maintaining code quality and developer productivity.
