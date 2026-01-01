# Build and Deployment

## Overview

Lunatria uses Angular CLI's built-in build system with environment-specific configurations for development and production deployments. The build process includes TypeScript compilation, asset optimization, tree-shaking, and bundle generation.

## Build Configuration

### Angular Build Settings

The project uses Angular CLI's build configurations defined in `angular.json`:

```json
{
  "build": {
    "builder": "@angular-devkit/build-angular:browser",
    "options": {
      "outputPath": "dist/lunatria-website",
      "index": "src/index.html",
      "main": "src/main.ts",
      "polyfills": ["zone.js"],
      "tsConfig": "tsconfig.app.json",
      "assets": [
        "src/favicon.ico",
        "src/assets"
      ],
      "styles": [
        "src/styles.css"
      ],
      "scripts": []
    },
    "configurations": {
      "production": {
        "budgets": [
          {
            "type": "initial",
            "maximumWarning": "500kb",
            "maximumError": "1mb"
          },
          {
            "type": "anyComponentStyle",
            "maximumWarning": "2kb",
            "maximumError": "4kb"
          }
        ],
        "outputHashing": "all"
      },
      "development": {
        "buildOptimizer": false,
        "optimization": false,
        "vendorChunk": true,
        "extractLicenses": false,
        "sourceMap": true,
        "namedChunks": true
      }
    }
  }
}
```

### TypeScript Configuration

#### Main Application (`tsconfig.app.json`)

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "./out-tsc/app",
    "types": []
  },
  "files": [
    "src/main.ts"
  ],
  "include": [
    "src/**/*.d.ts"
  ]
}
```

#### Base Configuration (`tsconfig.json`)

```json
{
  "compileOnSave": false,
  "compilerOptions": {
    "baseUrl": "./",
    "outDir": "./dist/out-tsc",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "sourceMap": true,
    "declaration": false,
    "downlevelIteration": true,
    "experimentalDecorators": true,
    "moduleResolution": "bundler",
    "importHelpers": true,
    "target": "ES2022",
    "module": "ES2022",
    "useDefineForClassFields": false,
    "lib": [
      "ES2022",
      "dom"
    ]
  }
}
```

## Build Commands

### Development Build

```bash
# Development build with file watching
npm run watch
# or
ng build --watch --configuration development

# Single development build
ng build --configuration development
```

**Development Build Features**:
- Source maps enabled for debugging
- No minification for faster builds
- Vendor chunk separation
- No file hashing for easier development

### Production Build

```bash
# Production build
npm run build
# or
ng build --configuration production

# Production build with stats
ng build --configuration production --stats-json
```

**Production Build Features**:
- Code minification and optimization
- Tree-shaking to remove unused code
- File hashing for cache busting
- Bundle size analysis
- Dead code elimination

### Build Output Analysis

```bash
# Generate build statistics
ng build --stats-json

# Analyze bundle size (requires webpack-bundle-analyzer)
npx webpack-bundle-analyzer dist/lunatria-website/stats.json
```

## Environment-Specific Builds

### Development Environment

```typescript
// environment.ts
export const environment = {
  production: false,
  apiBaseUrl: 'https://api.lunatria.test',
};
```

**Build Command**:
```bash
ng build --configuration development
```

**Characteristics**:
- Larger bundle size
- Source maps included
- Debug information retained
- Faster build times

### Production Environment

```typescript
// environment.prod.ts
export const environment = {
  production: true,
  apiBaseUrl: 'https://api.lunatria.com',
};
```

**Build Command**:
```bash
ng build --configuration production
```

**Characteristics**:
- Minimized bundle size
- Optimized code
- No source maps
- Cache-friendly file naming

## Asset Management

### Static Assets

Assets are copied during build from `src/assets/`:

```
src/assets/
├── lunatria-background.png     # Background image
├── i18n/                       # Translation files
│   ├── en.json
│   └── pl.json
└── icons/                      # Service icons
    ├── hoarder.png
    ├── jellyfin.png
    ├── nextcloud.png
    ├── radarr.svg
    ├── sonarr.svg
    └── vaultwarden.png
```

### Asset Optimization

```json
// angular.json - asset optimization
"assets": [
  "src/favicon.ico",
  {
    "glob": "**/*",
    "input": "src/assets",
    "output": "/assets"
  }
]
```

**Automatic Optimizations**:
- Image compression (production builds)
- Asset fingerprinting for caching
- Unused asset elimination
- Path optimization

## Bundle Analysis

### Bundle Size Monitoring

The build configuration includes budget limits:

```json
"budgets": [
  {
    "type": "initial",
    "maximumWarning": "500kb",
    "maximumError": "1mb"
  },
  {
    "type": "anyComponentStyle",
    "maximumWarning": "2kb", 
    "maximumError": "4kb"
  }
]
```

### Bundle Composition

Typical production build output:

```
dist/lunatria-website/
├── index.html                  # Main HTML file
├── main.[hash].js             # Application code
├── polyfills.[hash].js        # Browser polyfills
├── runtime.[hash].js          # Angular runtime
├── styles.[hash].css          # Global styles
├── assets/                    # Static assets
└── favicon.ico               # Application icon
```

### Performance Optimization

**Code Splitting**:
- Lazy-loaded routes (future implementation)
- Vendor chunk separation
- Common chunk extraction

**Tree Shaking**:
- Removes unused imports
- Eliminates dead code
- Optimizes bundle size

## Deployment Strategies

### Static File Deployment

Lunatria generates static files suitable for various hosting platforms:

#### Traditional Web Server

```bash
# Build for production
ng build --configuration production

# Copy files to web server
scp -r dist/lunatria-website/* user@server:/var/www/html/
```

#### Nginx Configuration

```nginx
server {
    listen 80;
    server_name lunatria.com;
    root /var/www/html;
    index index.html;

    # Handle Angular routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";
}
```

#### Apache Configuration

```apache
<VirtualHost *:80>
    ServerName lunatria.com
    DocumentRoot /var/www/html
    
    # Handle Angular routes
    <Directory /var/www/html>
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>

    # Cache static files
    <FilesMatch "\.(js|css|png|jpg|jpeg|gif|ico|svg)$">
        ExpiresActive On
        ExpiresDefault "access plus 1 year"
    </FilesMatch>
</VirtualHost>
```

### Container Deployment

#### Dockerfile

```dockerfile
# Multi-stage build
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built app
COPY --from=builder /app/dist/lunatria-website /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Docker Compose

```yaml
version: '3.8'

services:
  lunatria-frontend:
    build: .
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
    
  lunatria-backend:
    image: lunatria-api:latest
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
```

### Cloud Deployment

#### AWS S3 + CloudFront

```bash
# Build for production
ng build --configuration production

# Deploy to S3
aws s3 sync dist/lunatria-website/ s3://lunatria-website-bucket --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id E123456789 --paths "/*"
```

#### Netlify Deployment

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build and deploy
ng build --configuration production
netlify deploy --prod --dir=dist/lunatria-website
```

**netlify.toml**:
```toml
[build]
  publish = "dist/lunatria-website"
  command = "ng build --configuration production"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### Vercel Deployment

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist/lunatria-website"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

## CI/CD Pipeline

### GitHub Actions

```yaml
name: Build and Deploy

on:
  push:
    branches: [ main, admin-panel ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run tests
      run: npm test -- --watch=false --browsers=ChromeHeadless

    - name: Build application
      run: npm run build

    - name: Deploy to staging
      if: github.ref == 'refs/heads/admin-panel'
      run: |
        # Deploy to staging environment
        echo "Deploying to staging..."

    - name: Deploy to production
      if: github.ref == 'refs/heads/main'
      run: |
        # Deploy to production environment
        echo "Deploying to production..."
```

### GitLab CI

```yaml
stages:
  - test
  - build
  - deploy

variables:
  NODE_VERSION: "18"

test:
  stage: test
  image: node:$NODE_VERSION
  script:
    - npm ci
    - npm test -- --watch=false --browsers=ChromeHeadless
  artifacts:
    reports:
      coverage: coverage/lunatria-website/lcov.info

build:
  stage: build
  image: node:$NODE_VERSION
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - dist/lunatria-website/
    expire_in: 1 week

deploy:production:
  stage: deploy
  script:
    - echo "Deploying to production..."
    # Add deployment commands here
  only:
    - main
```

## Environment Variables in Deployment

### Build-Time Variables

```bash
# Set during build process
export API_BASE_URL=https://api.lunatria.com
export NODE_ENV=production

ng build --configuration production
```

### Runtime Configuration

For dynamic configuration:

```typescript
// config.service.ts
@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private config: any;

  constructor(private http: HttpClient) {}

  async loadConfig() {
    this.config = await this.http.get('/assets/config.json').toPromise();
  }

  get(key: string) {
    return this.config[key];
  }
}
```

```json
// assets/config.json
{
  "apiBaseUrl": "https://api.lunatria.com",
  "version": "0.5.2-beta",
  "features": {
    "adminPanel": true,
    "multiLanguage": true
  }
}
```

## Monitoring and Health Checks

### Build Monitoring

```typescript
// health-check.service.ts
@Injectable({
  providedIn: 'root'
})
export class HealthCheckService {
  constructor(private http: HttpClient) {}

  async checkHealth() {
    try {
      await this.http.get('/health').toPromise();
      return { status: 'healthy', timestamp: new Date() };
    } catch (error) {
      return { status: 'unhealthy', error, timestamp: new Date() };
    }
  }
}
```

### Performance Monitoring

```typescript
// performance.service.ts
@Injectable({
  providedIn: 'root'
})
export class PerformanceService {
  trackPageLoad() {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const loadTime = navigation.loadEventEnd - navigation.fetchStart;
    
    console.log(`Page load time: ${loadTime}ms`);
    // Send to analytics service
  }
}
```

## Troubleshooting Build Issues

### Common Build Problems

1. **Memory Issues**:
```bash
# Increase Node.js memory
export NODE_OPTIONS="--max-old-space-size=8192"
ng build
```

2. **Dependency Conflicts**:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

3. **TypeScript Errors**:
```bash
# Check TypeScript version compatibility
ng version
npm ls typescript
```

4. **Bundle Size Issues**:
```bash
# Analyze bundle size
ng build --stats-json
npx webpack-bundle-analyzer dist/lunatria-website/stats.json
```

### Build Optimization Tips

1. **Enable Build Optimizer**: Automatically enabled in production
2. **Use OnPush Change Detection**: Improve runtime performance
3. **Implement Lazy Loading**: Reduce initial bundle size
4. **Optimize Images**: Use WebP format and responsive images
5. **Tree-shake Unused Libraries**: Remove unused dependencies

## Rollback Strategies

### Version Management

```bash
# Tag releases
git tag -a v0.5.2 -m "Release version 0.5.2"
git push origin v0.5.2

# Rollback to previous version
git checkout v0.5.1
ng build --configuration production
# Deploy previous version
```

### Blue-Green Deployment

```bash
# Deploy to green environment
./deploy-green.sh

# Test green environment
./test-environment.sh green

# Switch traffic to green
./switch-traffic.sh green

# Keep blue as fallback
./monitor-green.sh
```

This comprehensive build and deployment guide ensures reliable, efficient deployment processes for the Lunatria application across different environments and hosting platforms.
