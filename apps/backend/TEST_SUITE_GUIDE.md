# Lunatria Backend - Test Suite Guide

## Overview

This guide explains the test suite setup for the Lunatria backend. The project uses **Jest** as the testing framework with **@nestjs/testing** for NestJS-specific utilities.

## Quick Start

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode (re-run on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:cov

# Run E2E tests
npm run test:e2e

# Debug tests
npm run test:debug
```

### Test File Structure

Test files follow the NestJS convention:
- **Unit tests**: Placed next to the implementation file with `.spec.ts` suffix
- **E2E tests**: Located in `/test/` directory with `.e2e-spec.ts` suffix

Example:
```
src/
  auth/
    auth.service.ts
    auth.service.spec.ts     ← Unit test
  users/
    users.service.ts
    users.service.spec.ts    ← Unit test
test/
  auth.e2e-spec.ts           ← E2E test
```

## Test Files Included

### Core Service Tests

#### 1. **auth.service.spec.ts** - Authentication Service
Tests:
- User validation with correct password
- User validation with incorrect password
- Exception handling for non-existent users

#### 2. **users.service.spec.ts** - Users Service
Tests:
- Fetching user by username
- Fetching user by ID
- Checking username uniqueness
- User creation and deletion

#### 3. **credentials.service.spec.ts** - Credentials Service
Tests:
- Encrypting and storing credentials
- Retrieving and decrypting credentials
- Credential deletion
- Handling non-existent credentials

#### 4. **encryption.service.spec.ts** - Encryption Service
Tests:
- Encrypting data with random IVs
- Decrypting data correctly
- Handling various data types (objects, arrays, nested structures)
- Error handling for corrupted data
- Round-trip encryption integrity

#### 5. **sessions.service.spec.ts** - Sessions Service
Tests:
- Session creation and retrieval
- Session invalidation
- User session tracking

## Test Utilities

### Using Test Utilities

The `src/test-utils/test-utils.ts` file provides helper functions for common testing patterns:

```typescript
import {
  createMockMongooseModel,
  createMockRedisClient,
  createMockUser,
  createMockAdminUser,
  setupTestEnvironment,
  cleanupTestEnvironment,
} from 'src/test-utils/test-utils';

describe('MyService', () => {
  beforeEach(() => {
    setupTestEnvironment();
  });

  afterEach(() => {
    cleanupTestEnvironment();
  });

  it('should test something', () => {
    const user = createMockUser({ username: 'custom' });
    expect(user.username).toBe('custom');
  });
});
```

### Available Utilities

- `createMockMongooseModel()` - Creates a mock MongoDB model
- `createMockRedisClient()` - Creates a mock Redis client
- `createMockUser()` - Creates a mock user object
- `createMockAdminUser()` - Creates a mock admin user
- `createMockCredential()` - Creates a mock credential
- `createMockSession()` - Creates a mock session
- `setupTestEnvironment()` - Sets up test environment variables
- `cleanupTestEnvironment()` - Cleans up environment variables
- `createMockRequest()` - Creates a mock HTTP request
- `createMockResponse()` - Creates a mock HTTP response
- `expectThrowException()` - Helper to test exception throwing

## Jest Configuration

The Jest configuration is in `package.json`:

```json
{
  "jest": {
    "moduleFileExtensions": ["js", "json", "ts"],
    "rootDir": "src",
    "testRegex": ".*\\.spec\\.ts$",
    "transform": {
      "^.+\\.(t|j)s$": "ts-jest"
    },
    "collectCoverageFrom": [
      "**/*.(t|j)s"
    ],
    "coverageDirectory": "../coverage",
    "testEnvironment": "node"
  }
}
```

**Key Settings:**
- `rootDir: "src"` - Tests are run from the src directory
- `testRegex: ".*\\.spec\\.ts$"` - Files matching `*.spec.ts` are test files
- `collectCoverageFrom` - Coverage collection for all `.ts` and `.js` files
- `testEnvironment: "node"` - Tests run in Node.js environment (not jsdom)

## Writing New Tests

### Template for Service Tests

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { MyService } from './my.service';
import { SomeDependency } from './some.dependency';

describe('MyService', () => {
  let service: MyService;
  let dependency: SomeDependency;

  const mockDependency = {
    method: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MyService,
        {
          provide: SomeDependency,
          useValue: mockDependency,
        },
      ],
    }).compile();

    service = module.get<MyService>(MyService);
    dependency = module.get<SomeDependency>(SomeDependency);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('methodName', () => {
    it('should do something', async () => {
      mockDependency.method.mockResolvedValueOnce(expectedValue);

      const result = await service.methodName();

      expect(result).toEqual(expectedValue);
      expect(mockDependency.method).toHaveBeenCalledWith(expectedArgs);
    });
  });
});
```

### Template for Controller Tests

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { MyController } from './my.controller';
import { MyService } from './my.service';

describe('MyController', () => {
  let controller: MyController;
  let service: MyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MyController],
      providers: [
        {
          provide: MyService,
          useValue: {
            method: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<MyController>(MyController);
    service = module.get<MyService>(MyService);
  });

  describe('endpoint', () => {
    it('should return data', async () => {
      const expected = { data: 'test' };
      jest.spyOn(service, 'method').mockResolvedValueOnce(expected);

      const result = await controller.endpoint();

      expect(result).toEqual(expected);
    });
  });
});
```

## Mocking Best Practices

### 1. Mock External Dependencies
```typescript
const mockService = {
  method: jest.fn(),
};
```

### 2. Setup Return Values
```typescript
mockService.method.mockResolvedValueOnce(value); // For promises
mockService.method.mockReturnValueOnce(value);   // For sync functions
mockService.method.mockRejectedValueOnce(error); // For promise rejections
```

### 3. Verify Mock Calls
```typescript
expect(mockService.method).toHaveBeenCalled();
expect(mockService.method).toHaveBeenCalledWith(arg1, arg2);
expect(mockService.method).toHaveBeenCalledTimes(1);
```

### 4. Clear Mocks Between Tests
```typescript
afterEach(() => {
  jest.clearAllMocks();
});
```

## Coverage Goals

Current coverage targets:
- **Statements**: 80%+
- **Branches**: 75%+
- **Functions**: 80%+
- **Lines**: 80%+

View coverage report:
```bash
npm run test:cov
```

Coverage reports are generated in `/coverage` directory.

## Continuous Integration

Tests are automatically run on:
- Pull requests
- Commits to main branch
- Docker image builds

See `.github/workflows/` for CI configuration.

## Debugging Tests

### Debug in VSCode

Add this configuration to `.vscode/launch.json`:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Jest Tests",
  "program": "${workspaceFolder}/apps/backend/node_modules/.bin/jest",
  "args": ["--runInBand", "--no-coverage"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

Then run: `npm run test:debug`

### Using console.log

```typescript
it('should debug', () => {
  const value = someFunction();
  console.log('Debug value:', value);
  expect(value).toBeDefined();
});
```

## Common Issues & Solutions

### 1. "Cannot find module" errors
- Ensure `tsconfig.json` paths are correct
- Check `rootDir` and `moduleFileExtensions` in Jest config

### 2. Tests timeout
- Increase Jest timeout: `jest.setTimeout(10000);`
- Check for hanging promises or unresolved mocks

### 3. Mock not working
- Clear previous mocks: `jest.clearAllMocks()`
- Verify mock is set before calling function
- Use `jest.spyOn()` for existing methods

### 4. Environment variables not set
- Use `setupTestEnvironment()` from test-utils
- Set in `beforeEach()`, not globally

## Resources

- [Jest Documentation](https://jestjs.io/)
- [NestJS Testing Documentation](https://docs.nestjs.com/fundamentals/testing)
- [Mongoose Mocking Best Practices](https://mongoosejs.com/docs/api/model.html)

## Next Steps

1. **Expand Coverage**: Add more test cases as features are developed
2. **Integration Tests**: Create E2E tests for complete workflows
3. **Performance Tests**: Add tests for critical performance paths
4. **Security Tests**: Add tests for authentication and authorization flows
