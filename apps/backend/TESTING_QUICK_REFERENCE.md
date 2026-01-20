# Lunatria Backend - Test Suite Quick Reference

## ⚡ Quick Commands

```bash
# Run all tests (current status: 31/31 passing ✅)
npm run test

# Run tests and watch for changes
npm run test:watch

# Generate coverage report
npm run test:cov

# Debug tests in VSCode
npm run test:debug

# Run E2E tests
npm run test:e2e
```

## 📁 Test Files Overview

| File | Tests | Status |
|------|-------|--------|
| [auth.service.spec.ts](src/auth/auth.service.spec.ts) | 3 | ✅ PASS |
| [users.service.spec.ts](src/users/users.service.spec.ts) | 6 | ✅ PASS |
| [credentials.service.spec.ts](src/credentials/credentials.service.spec.ts) | 4 | ✅ PASS |
| [encryption.service.spec.ts](src/credentials/encryption/encryption.service.spec.ts) | 8 | ✅ PASS |
| [sessions.service.spec.ts](src/sessions/sessions.service.spec.ts) | 5 | ✅ PASS |
| [profile-picture.service.spec.ts](src/users/profile-picture.service.spec.ts) | 1 | ✅ PASS |
| **Total** | **31** | **✅ PASS** |

## 🛠️ What's Included

✅ **Jest Testing Framework** - Latest version with ts-jest  
✅ **Test Utilities** - Mock helpers and test data factories  
✅ **Core Module Tests** - Auth, Users, Credentials, Encryption, Sessions  
✅ **Configuration** - jest.config.js with proper module resolution  
✅ **Documentation** - TEST_SUITE_GUIDE.md with comprehensive instructions  
✅ **Mock Objects** - Users, credentials, sessions, Redis clients  

## 📚 Documentation

- [TEST_SUITE_GUIDE.md](TEST_SUITE_GUIDE.md) - Complete testing guide
- [TEST_SETUP_SUMMARY.md](TEST_SETUP_SUMMARY.md) - Setup summary
- [src/test-utils/test-utils.ts](src/test-utils/test-utils.ts) - Reusable test utilities

## 🧪 Creating New Tests

### Service Test Template

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { MyService } from './my.service';

describe('MyService', () => {
  let service: MyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MyService],
    }).compile();

    service = module.get<MyService>(MyService);
  });

  it('should do something', () => {
    expect(service).toBeDefined();
  });
});
```

### Using Test Utilities

```typescript
import {
  createMockUser,
  createMockAdminUser,
  setupTestEnvironment,
} from 'src/test-utils/test-utils';

beforeEach(() => {
  setupTestEnvironment();
  const user = createMockUser({ username: 'test' });
});
```

## 🎯 Coverage Goals

- **Statements**: 80%+
- **Branches**: 75%+
- **Functions**: 80%+
- **Lines**: 80%+

View current coverage:
```bash
npm run test:cov
```

## 🔧 Configuration

### jest.config.js
- `rootDir: 'src'` - Tests run from src directory
- `testRegex: '.*\.spec\.ts$'` - Test file pattern
- `moduleNameMapper` - Handles `src/` import aliases
- Node.js environment for NestJS compatibility

### package.json
- Removed inline jest config (moved to jest.config.js)
- All scripts ready to use

## ✨ Test Utilities Available

```typescript
// Mock objects
createMockMongooseModel()
createMockRedisClient()
createMockUser()
createMockAdminUser()
createMockCredential()
createMockSession()

// Environment setup
setupTestEnvironment()
cleanupTestEnvironment()

// HTTP mocks
createMockRequest()
createMockResponse()

// Helpers
expectThrowException()
wait(ms)
```

## 🚀 Next Steps

1. **Expand Coverage**: Add tests for controllers and guards
2. **Integration Tests**: Create E2E tests for full workflows
3. **Performance Tests**: Add tests for critical paths
4. **Security Tests**: Add tests for auth/authorization

## 📋 Checklist for New Features

When adding new features:
- [ ] Create `.spec.ts` file for the module
- [ ] Mock all external dependencies
- [ ] Test happy path, error cases, and edge cases
- [ ] Ensure test file follows naming convention
- [ ] Run `npm run test` to verify
- [ ] Check coverage with `npm run test:cov`
- [ ] Update relevant documentation

## 🆘 Troubleshooting

**Tests not found?**
```bash
npm run test -- --listTests
```

**Import errors?**
- Check jest.config.js moduleNameMapper
- Verify file exists and is not empty

**Timeout errors?**
```typescript
jest.setTimeout(10000); // Increase timeout in test file
```

**Mock not working?**
```typescript
jest.clearAllMocks(); // Clear mocks between tests
```

---

## 📞 Support

For detailed help, see:
- [TEST_SUITE_GUIDE.md](TEST_SUITE_GUIDE.md) - Complete documentation
- [src/test-utils/test-utils.ts](src/test-utils/test-utils.ts) - Utility source code
