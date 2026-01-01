# Development Setup

## Prerequisites

Before setting up the Lunatria development environment, ensure you have the following installed:

### Required Software

| Software | Version | Purpose |
|----------|---------|---------|
| **Node.js** | 18.x or 20.x | JavaScript runtime |
| **npm** | 9.x+ | Package manager |
| **Angular CLI** | 19.x | Angular development tools |
| **Git** | Latest | Version control |
| **VS Code** | Latest | Recommended IDE |

### System Requirements

- **Operating System**: Windows 10+, macOS 10.15+, or Linux (Ubuntu 18.04+)
- **RAM**: Minimum 8GB (16GB recommended)
- **Disk Space**: At least 2GB free space
- **Network**: Stable internet connection for package downloads

## Environment Setup

### 1. Clone the Repository

```bash
# Clone the repository
git clone https://github.com/LonleySailor/lunatria.git

# Navigate to project directory
cd lunatria

# Switch to development branch (if needed)
git checkout admin-panel
```

### 2. Install Dependencies

```bash
# Install npm dependencies
npm install

# Verify installation
npm list --depth=0
```

Expected major dependencies:
- Angular 19.2.0
- TypeScript 5.7.2
- ngx-translate 16.0.4
- ngx-toastr 19.0.0

### 3. Environment Configuration

#### Development Environment File

Create or verify `src/environments/environment.ts`:

```typescript
// environment.ts (for development)
export const environment = {
  production: false,
  apiBaseUrl: 'https://api.lunatria.test',
  // apiBaseUrl: 'http://localhost:3000', // Alternative local backend
};
```

#### Production Environment File

Verify `src/environments/environment.prod.ts`:

```typescript
// environment.prod.ts (for production)
export const environment = {
  production: true,
  apiBaseUrl: 'https://api.lunatria.com',
};
```

### 4. Proxy Configuration

The development server uses a proxy configuration for API calls. Verify `proxy.conf.json`:

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

### 5. Angular Configuration

Verify `angular.json` development server configuration:

```json
{
  "serve": {
    "builder": "@angular-devkit/build-angular:dev-server",
    "options": {
      "proxyConfig": "proxy.conf.json",
      "host": "0.0.0.0",
      "port": 4200,
      "publicHost": "lunatria.com:4200"
    }
  }
}
```

## IDE Setup (VS Code)

### Recommended Extensions

Install these VS Code extensions for optimal development experience:

```json
{
  "recommendations": [
    "angular.ng-template",
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-json",
    "formulahendry.auto-rename-tag",
    "ms-vscode.vscode-eslint"
  ]
}
```

### VS Code Settings

Create `.vscode/settings.json`:

```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.suggest.autoImports": true,
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.organizeImports": "explicit"
  },
  "files.associations": {
    "*.html": "html"
  },
  "emmet.includeLanguages": {
    "html": "html"
  }
}
```

### Launch Configuration

Create `.vscode/launch.json` for debugging:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "ng serve",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/@angular/cli/bin/ng",
      "args": ["serve"],
      "console": "integratedTerminal"
    },
    {
      "name": "ng test",
      "type": "node", 
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/@angular/cli/bin/ng",
      "args": ["test"],
      "console": "integratedTerminal"
    }
  ]
}
```

### Tasks Configuration

Create `.vscode/tasks.json`:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "ng serve",
      "type": "shell",
      "command": "ng serve",
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "shared"
      },
      "isBackground": true,
      "problemMatcher": "$tsc-watch"
    },
    {
      "label": "ng build",
      "type": "shell",
      "command": "ng build",
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "shared"
      }
    }
  ]
}
```

## Development Server

### Starting the Development Server

```bash
# Start development server
npm start
# or
ng serve

# Start with specific host (for network access)
ng serve --host 0.0.0.0 --port 4200

# Start with polling (for file watching issues)
ng serve --poll=2000
```

### Development URLs

- **Local Access**: `http://localhost:4200`
- **Network Access**: `http://lunatria.com:4200` (with proxy)
- **API Endpoint**: `https://api.lunatria.test`

### Hot Reload

The development server includes hot reload functionality:
- File changes automatically trigger browser refresh
- TypeScript compilation errors shown in browser
- Console displays build status and errors

## Backend Integration

### Local Backend Setup (Optional)

If running a local backend for development:

```typescript
// Modify environment.ts for local backend
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:3000', // Local backend
};
```

### API Endpoint Testing

Test API connectivity:

```bash
# Test session endpoint
curl -X GET https://api.lunatria.test/sessions/issessionactive \
  -H "Accept: application/json" \
  --cookie-jar cookies.txt

# Test login endpoint
curl -X POST https://api.lunatria.test/users/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  --cookie-jar cookies.txt \
  -d '{"username":"testuser","password":"testpass"}'
```

## Development Workflow

### Branch Management

```bash
# Check current branch
git branch

# Create feature branch
git checkout -b feature/new-feature

# Switch between branches
git checkout admin-panel
git checkout main
```

### File Watching

For file watching issues on Linux:

```bash
# Increase inotify limit
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# Or use polling mode
ng serve --poll=2000
```

### Common Development Commands

```bash
# Development server
npm start

# Run tests
npm test

# Build for production
npm run build

# Lint code
ng lint

# Generate component
ng generate component components/new-component

# Generate service
ng generate service services/new-service

# Generate guard
ng generate guard guards/new-guard
```

## Debugging Setup

### Browser DevTools

Configure browser for optimal debugging:

1. **Chrome DevTools**:
   - Enable source maps
   - Set breakpoints in TypeScript files
   - Use Angular DevTools extension

2. **Firefox Developer Tools**:
   - Enable TypeScript debugging
   - Use Vue DevTools for state inspection

### Angular DevTools

Install Angular DevTools browser extension:
- Component tree inspection
- Route debugging
- Service injection analysis
- Performance profiling

### Debug Configuration

```typescript
// Enable Angular debug mode in development
import { enableProdMode } from '@angular/core';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
} else {
  // Development mode - enables debugging
  console.log('Development mode enabled');
}
```

## Common Development Issues

### Port Already in Use

```bash
# Find process using port 4200
lsof -ti:4200

# Kill process
kill -9 $(lsof -ti:4200)

# Or use different port
ng serve --port 4201
```

### Node Version Issues

```bash
# Check Node version
node --version

# Use Node Version Manager (if installed)
nvm use 18
nvm use 20

# Clear npm cache
npm cache clean --force
```

### Permission Issues (macOS/Linux)

```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules

# Or use npx for global commands
npx @angular/cli@latest new project-name
```

### SSL Certificate Issues

For HTTPS development:

```bash
# Generate self-signed certificate
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes

# Start with HTTPS
ng serve --ssl --ssl-key key.pem --ssl-cert cert.pem
```

## Performance Optimization

### Development Build Optimization

```bash
# Start with source map optimization
ng serve --source-map=true

# Disable source maps for faster builds
ng serve --source-map=false

# Enable build optimizer
ng serve --build-optimizer
```

### Memory Management

```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=8192"

# Or set in package.json
"scripts": {
  "start": "node --max-old-space-size=8192 node_modules/@angular/cli/bin/ng serve"
}
```

## Testing Setup

### Unit Testing Configuration

Verify `karma.conf.js` configuration:

```javascript
module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    browsers: ['Chrome'],
    singleRun: false,
    restartOnFileChange: true
  });
};
```

### Test Commands

```bash
# Run tests once
npm test

# Run tests in watch mode
ng test

# Run tests with coverage
ng test --code-coverage

# Run e2e tests (if configured)
ng e2e
```

## Environment Variables

### Development Environment Variables

Create `.env` file (if supported):

```bash
# API Configuration
API_BASE_URL=https://api.lunatria.test
PROXY_TARGET=http://lunatria.com

# Development flags
DEBUG_MODE=true
ENABLE_SOURCE_MAPS=true
```

### Environment Switching

```bash
# Build for specific environment
ng build --configuration=development
ng build --configuration=production

# Serve with specific environment
ng serve --configuration=development
```

## Code Quality Tools

### Linting Setup

Install and configure ESLint:

```bash
# Install ESLint
ng add @angular-eslint/schematics

# Run linting
ng lint

# Fix auto-fixable issues
ng lint --fix
```

### Prettier Configuration

Create `.prettierrc`:

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

### Pre-commit Hooks

Install Husky for pre-commit hooks:

```bash
# Install Husky
npm install --save-dev husky

# Add pre-commit hook
npx husky add .husky/pre-commit "ng lint && ng test --watch=false"
```

## Troubleshooting

### Common Solutions

1. **Clear node_modules**: `rm -rf node_modules && npm install`
2. **Clear Angular cache**: `ng cache clean`
3. **Update dependencies**: `ng update`
4. **Check Angular compatibility**: `ng version`

### Getting Help

- **Angular Documentation**: https://angular.io/docs
- **Angular CLI Documentation**: https://angular.io/cli
- **Stack Overflow**: Tag questions with `angular` and `typescript`
- **GitHub Issues**: Check existing issues in the project repository
