# Internationalization (i18n)

## Overview

Lunatria implements internationalization using Angular's ngx-translate library, providing multi-language support with a focus on English and Polish locales. The system uses JSON-based translation files and a custom HTTP loader for dynamic language loading.

## i18n Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    TRANSLATION SYSTEM                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐    ┌─────────────────┐               │
│  │   COMPONENTS    │    │  TRANSLATION    │               │
│  │                 │◄──►│    PIPES        │               │
│  │ • Templates     │    │                 │               │
│  │ • Dynamic Text  │    │ • {{ 'key' |    │               │
│  │ • User Content  │    │   translate }}  │               │
│  └─────────────────┘    └─────────────────┘               │
│                                  │                        │
│                                  ▼                        │
│  ┌─────────────────────────────────────────────────────┐  │
│  │            TRANSLATE SERVICE                        │  │
│  │                                                     │  │
│  │ • Language switching                                │  │
│  │ • Translation loading                               │  │
│  │ • Fallback handling                                 │  │
│  │ • Cache management                                  │  │
│  └─────────────────────────────────────────────────────┘  │
│                                  │                        │
│                                  ▼                        │
│  ┌─────────────────────────────────────────────────────┐  │
│  │          CUSTOM HTTP LOADER                         │  │
│  │                                                     │  │
│  │ • Dynamic file loading                              │  │
│  │ • Error handling                                    │  │
│  │ • Response mapping                                  │  │
│  └─────────────────────────────────────────────────────┘  │
│                                  │                        │
│                                  ▼                        │
│  ┌─────────────────────────────────────────────────────┐  │
│  │           TRANSLATION FILES                         │  │
│  │                                                     │  │
│  │ • /assets/i18n/en.json                              │  │
│  │ • /assets/i18n/pl.json                              │  │
│  │ • Structured JSON format                            │  │
│  │ • Nested key support                                │  │
│  └─────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Custom Translation Loader

### TranslateHttpLoader Implementation

```typescript
import { TranslateLoader } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export class TranslateHttpLoader implements TranslateLoader {
  constructor(private http: HttpClient) {}

  /**
   * Loads translation file for specified language
   * @param lang - Language code (e.g., 'en', 'pl')
   * @returns Observable containing translation data
   */
  getTranslation(lang: string): Observable<any> {
    return this.http.get(`/assets/i18n/${lang}.json`).pipe(
      map((response: any) => response)
    );
  }
}
```

### Key Features

**Dynamic Loading**:
- Loads translation files on demand
- HTTP-based file retrieval from `/assets/i18n/`
- Observable-based loading for async operations

**Error Handling**:
- Built-in fallback through ngx-translate
- Graceful handling of missing translation files
- Default language fallback support

**Caching**:
- Automatic caching by ngx-translate service
- Reduces redundant HTTP requests
- Improved performance for language switching

## Application Configuration

### Module Setup

```typescript
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from './translate-http-loader';

export const appConfig: ApplicationConfig = {
  providers: [
    // ... other providers
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useClass: TranslateHttpLoader,  // Custom loader
          deps: [HttpClient]
        }
      })
    )
  ]
};
```

### Component Integration

```typescript
// Components import TranslateModule for template usage
@Component({
  selector: 'app-component',
  imports: [
    TranslateModule,  // Required for translate pipe
    // ... other imports
  ],
  template: `
    <button>{{ 'Buttons.Check All Services' | translate }}</button>
    <p>{{ 'Toast.Unauthorized' | translate }}</p>
  `
})
export class SomeComponent { }
```

## Translation File Structure

### English Translation File (`/assets/i18n/en.json`)

```json
{
  "Toast": {
    "Success": "Success",
    "Error": "Error", 
    "Unauthorized": "You must be logged in to access this page."
  },
  "Buttons": {
    "Check All Services": "Check All Services"
  },
  "AUTH": {
    "LOGOUT": "Logout"
  }
}
```

### Polish Translation File (`/assets/i18n/pl.json`)

```json
{
  "Toast": {
    "Success": "Sukces",
    "Error": "Błąd",
    "Unauthorized": "Musisz być zalogowany, aby uzyskać dostęp do tej strony."
  },
  "Buttons": {
    "Check All Services": "Sprawdź wszystkie usługi"
  },
  "AUTH": {
    "LOGOUT": "Wyloguj"
  }
}
```

### Translation Key Structure

**Hierarchical Organization**:
- Logical grouping by feature/component
- Nested structure for organization
- Consistent naming conventions

**Key Categories**:
- `Toast.*` - Notification messages
- `Buttons.*` - Button labels and actions
- `AUTH.*` - Authentication-related text
- `Errors.*` - Error messages (expandable)
- `Navigation.*` - Menu and navigation items (expandable)

## Usage Patterns

### Template Usage

```html
<!-- Basic translation pipe -->
<button class="logout-btn">
  {{ 'AUTH.LOGOUT' | translate }}
</button>

<!-- Service check button -->
<button (click)="checkAllServices()">
  {{ 'Buttons.Check All Services' | translate }}
</button>

<!-- Error messages -->
<div class="error-message">
  {{ 'Toast.Unauthorized' | translate }}
</div>
```

### Component Usage

```typescript
import { TranslateService } from '@ngx-translate/core';

export class ComponentWithTranslation {
  constructor(private translate: TranslateService) {}

  ngOnInit() {
    // Set default language
    this.translate.setDefaultLang('en');
    
    // Use current language or detect from browser
    this.translate.use('en');
  }

  showTranslatedMessage() {
    this.translate.get('Toast.Success').subscribe((translation: string) => {
      this.toastr.success(translation);
    });
  }

  switchLanguage(lang: string) {
    this.translate.use(lang);
  }
}
```

### Guard Integration

```typescript
// Guards use translate service for consistent error messages
export const authGuard: CanActivateFn = async () => {
  const toastr = inject(ToastrService);
  
  if (!loggedIn) {
    // Uses translation key in toast notification
    toastr.error('You must be logged in to access this page.', 'Unauthorized');
    // In practice, could use: toastr.error(translate.instant('Toast.Unauthorized'), translate.instant('Toast.Error'));
  }
};
```

## Language Management

### Supported Languages

| Code | Language | Status | Coverage |
|------|----------|--------|----------|
| `en` | English | Primary | 100% |
| `pl` | Polish | Secondary | Partial |

### Default Language Configuration

```typescript
// Recommended setup in main component or app initializer
export class AppComponent implements OnInit {
  constructor(private translate: TranslateService) {}

  ngOnInit() {
    // Set fallback language
    this.translate.setDefaultLang('en');
    
    // Detect browser language or use default
    const browserLang = this.translate.getBrowserLang();
    const supportedLangs = ['en', 'pl'];
    const langToUse = supportedLangs.includes(browserLang || '') ? browserLang : 'en';
    
    this.translate.use(langToUse || 'en');
  }
}
```

### Language Switching Implementation

```typescript
export class LanguageSwitcherComponent {
  currentLang = 'en';
  availableLanguages = [
    { code: 'en', name: 'English' },
    { code: 'pl', name: 'Polski' }
  ];

  constructor(private translate: TranslateService) {
    this.currentLang = this.translate.currentLang || 'en';
  }

  switchLanguage(langCode: string) {
    this.translate.use(langCode);
    this.currentLang = langCode;
    
    // Optional: Store preference in localStorage
    localStorage.setItem('preferred-language', langCode);
  }
}
```

## Advanced Features

### Interpolation Support

```typescript
// Translation file with interpolation
{
  "Messages": {
    "Welcome": "Welcome, {{username}}!",
    "ItemCount": "You have {{count}} items"
  }
}
```

```html
<!-- Template usage with parameters -->
<p>{{ 'Messages.Welcome' | translate: {username: user.name} }}</p>
<p>{{ 'Messages.ItemCount' | translate: {count: items.length} }}</p>
```

### Pluralization Support

```typescript
// Translation file with ICU expressions
{
  "Messages": {
    "ServiceStatus": "{count, plural, =0 {No services} =1 {One service} other {{{count}} services}} running"
  }
}
```

### Async Loading Handling

```typescript
export class ComponentWithAsyncTranslation implements OnInit {
  translatedText$ = this.translate.get('Some.Key');

  constructor(private translate: TranslateService) {}

  ngOnInit() {
    // Handle translation loading
    this.translate.onLangChange.subscribe(() => {
      this.translatedText$ = this.translate.get('Some.Key');
    });
  }
}
```

## Best Practices

### Translation Key Management

1. **Hierarchical Structure**: Group keys logically by feature
2. **Consistent Naming**: Use clear, descriptive key names
3. **Avoid Duplication**: Reuse common phrases across components
4. **Context Clarity**: Make key names self-explanatory

### Performance Optimization

1. **Lazy Loading**: Only load needed translation files
2. **Caching**: Leverage ngx-translate built-in caching
3. **Bundle Size**: Consider splitting large translation files
4. **Preloading**: Preload primary language for better UX

### Development Workflow

1. **Key Extraction**: Use tools to extract translatable strings
2. **Translation Validation**: Ensure all keys have translations
3. **Testing**: Test with different languages during development
4. **Fallback Strategy**: Always provide English fallbacks

### Error Handling

```typescript
// Custom error handling for missing translations
export class TranslationErrorHandler {
  constructor(private translate: TranslateService) {
    this.translate.onMissingKey.subscribe((key: string) => {
      console.warn(`Missing translation key: ${key}`);
      // Optional: Report to monitoring service
    });
  }
}
```

## Extensibility

### Adding New Languages

1. Create new JSON file: `/assets/i18n/{lang}.json`
2. Add language to supported languages list
3. Update language switcher component
4. Provide complete translations for all keys

### Custom Translation Pipes

```typescript
// Custom pipe for date localization
@Pipe({ name: 'localizedDate' })
export class LocalizedDatePipe implements PipeTransform {
  constructor(private translate: TranslateService) {}

  transform(date: Date): string {
    const locale = this.translate.currentLang || 'en';
    return date.toLocaleDateString(locale);
  }
}
```

### Integration with Backend

```typescript
// Service to sync translations with backend
@Injectable()
export class TranslationSyncService {
  constructor(
    private http: HttpClient,
    private translate: TranslateService
  ) {}

  async loadServerTranslations(lang: string) {
    const serverTranslations = await this.http.get(`/api/i18n/${lang}`).toPromise();
    this.translate.setTranslation(lang, serverTranslations, true);
  }
}
```

## Testing Considerations

### Unit Testing with Translations

```typescript
describe('Component with Translations', () => {
  let component: TestComponent;
  let translate: TranslateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()]
    });
    
    translate = TestBed.inject(TranslateService);
    translate.setDefaultLang('en');
    translate.use('en');
  });

  it('should display translated text', () => {
    translate.setTranslation('en', { 'Test.Key': 'Test Value' });
    // Test component with translation
  });
});
```

### E2E Testing with Multiple Languages

```typescript
// Cypress test for language switching
describe('Language Switching', () => {
  it('should switch language to Polish', () => {
    cy.visit('/');
    cy.get('[data-cy=language-switcher]').select('pl');
    cy.get('[data-cy=logout-button]').should('contain', 'Wyloguj');
  });
});
```
