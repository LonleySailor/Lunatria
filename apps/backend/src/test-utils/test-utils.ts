import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';

/**
 * Test utility functions for Lunatria backend testing
 */

/**
 * Creates a mock MongoDB model for testing
 * Useful for testing services that interact with MongoDB collections
 */
export function createMockMongooseModel() {
  return {
    findOne: jest.fn(),
    findById: jest.fn(),
    find: jest.fn(),
    findOneAndUpdate: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findOneAndDelete: jest.fn(),
    findByIdAndDelete: jest.fn(),
    create: jest.fn(),
    insertMany: jest.fn(),
    deleteOne: jest.fn(),
    deleteMany: jest.fn(),
    updateOne: jest.fn(),
    updateMany: jest.fn(),
    countDocuments: jest.fn(),
    lean: jest.fn(),
    exec: jest.fn(),
    save: jest.fn(),
  };
}

/**
 * Creates a mock Redis client for testing session and caching operations
 */
export function createMockRedisClient() {
  return {
    get: jest.fn(),
    set: jest.fn(),
    setEx: jest.fn(),
    del: jest.fn(),
    exists: jest.fn(),
    keys: jest.fn(),
    flushDb: jest.fn(),
    sAdd: jest.fn(),
    sRem: jest.fn(),
    sMembers: jest.fn(),
    sIsMember: jest.fn(),
    hSet: jest.fn(),
    hGet: jest.fn(),
    hGetAll: jest.fn(),
    hDel: jest.fn(),
    expire: jest.fn(),
    ttl: jest.fn(),
    incr: jest.fn(),
    decr: jest.fn(),
  };
}

/**
 * Mock user object for testing
 */
export function createMockUser(overrides = {}) {
  return {
    _id: '507f1f77bcf86cd799439011',
    username: 'testuser',
    email: 'test@example.com',
    password: '$2b$10$hashedpassword',
    userType: 'user',
    allowedServices: ['jellyfin'],
    profilePicture: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/**
 * Mock admin user object for testing
 */
export function createMockAdminUser(overrides = {}) {
  return createMockUser({
    username: 'admin',
    email: 'admin@example.com',
    userType: 'admin',
    allowedServices: ['jellyfin', 'radarr', 'sonarr'],
    ...overrides,
  });
}

/**
 * Creates a mock credential object for testing
 */
export function createMockCredential(overrides = {}) {
  return {
    _id: '507f1f77bcf86cd799439012',
    userId: '507f1f77bcf86cd799439011',
    service: 'jellyfin',
    encryptedPayload: 'iv:encryptedhexstring',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/**
 * Creates a mock session object for testing
 */
export function createMockSession(overrides = {}) {
  return {
    sessionId: 'sess_abc123def456',
    userId: '507f1f77bcf86cd799439011',
    createdAt: new Date(),
    lastActivity: new Date(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    ...overrides,
  };
}

/**
 * Waits for a specified time (useful for async operations in tests)
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Helper to test that a function throws a specific exception
 */
export async function expectThrowException(fn: () => Promise<any>, expectedCode?: number) {
  let thrown = false;
  try {
    await fn();
  } catch (error: any) {
    thrown = true;
    if (expectedCode) {
      expect(error.response?.responseCode || error.responseCode).toBe(expectedCode);
    }
  }
  expect(thrown).toBe(true);
}

/**
 * Creates mock environment variables for testing
 */
export function setupTestEnvironment(overrides = {}) {
  const defaults = {
    MONGODB_URI: 'mongodb://localhost:27017/lunatria-test',
    REDIS_URL: 'redis://localhost:6379/1',
    DOMAIN_NAME: 'lunatria.test',
    PASSPORT_SECRET: 'test-secret-key-for-testing-only',
    CREDENTIAL_ENCRYPTION_KEY: 'a'.repeat(32),
    JELLYFIN_BASE_URL: 'http://jellyfin:8096',
    RADARR_BASE_URL: 'http://radarr:7878',
    SONARR_BASE_URL: 'http://sonarr:8989',
    NODE_ENV: 'test',
  };

  const environment = { ...defaults, ...overrides };

  Object.entries(environment).forEach(([key, value]) => {
    process.env[key] = value as string;
  });

  return environment;
}

/**
 * Cleans up test environment variables
 */
export function cleanupTestEnvironment() {
  const testVars = [
    'MONGODB_URI',
    'REDIS_URL',
    'DOMAIN_NAME',
    'PASSPORT_SECRET',
    'CREDENTIAL_ENCRYPTION_KEY',
    'JELLYFIN_BASE_URL',
    'RADARR_BASE_URL',
    'SONARR_BASE_URL',
  ];

  testVars.forEach((key) => {
    delete process.env[key];
  });
}

/**
 * Helper to create a mock request object for testing controllers
 */
export function createMockRequest(overrides = {}) {
  return {
    user: null,
    session: {},
    sessionID: 'sess_test123',
    headers: {},
    params: {},
    query: {},
    body: {},
    ...overrides,
  };
}

/**
 * Helper to create a mock response object for testing controllers
 */
export function createMockResponse() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    redirect: jest.fn().mockReturnThis(),
    setHeader: jest.fn().mockReturnThis(),
    end: jest.fn().mockReturnThis(),
  };
}
