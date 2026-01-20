import { EncryptionService } from './encryption.service';
import * as crypto from 'crypto';

describe('EncryptionService', () => {
  let service: EncryptionService;
  const testEncryptionKey = 'a'.repeat(32); // 32 characters for AES-256

  beforeEach(() => {
    process.env.CREDENTIAL_ENCRYPTION_KEY = testEncryptionKey;
    service = new EncryptionService();
  });

  afterEach(() => {
    delete process.env.CREDENTIAL_ENCRYPTION_KEY;
  });

  describe('encrypt', () => {
    it('should encrypt an object', () => {
      const data = { username: 'testuser', token: 'testtoken' };

      const encrypted = service.encrypt(data);

      // Encrypted format should be: iv:ciphertext in hex
      expect(encrypted).toBeTruthy();
      expect(typeof encrypted).toBe('string');
      const parts = encrypted.split(':');
      expect(parts).toHaveLength(2);
      expect(parts[0]).toMatch(/^[a-f0-9]{32}$/); // IV should be 16 bytes in hex
    });

    it('should produce different ciphertexts for same data (due to random IV)', () => {
      const data = { username: 'testuser' };

      const encrypted1 = service.encrypt(data);
      const encrypted2 = service.encrypt(data);

      expect(encrypted1).not.toBe(encrypted2); // Different IVs should produce different outputs
    });
  });

  describe('decrypt', () => {
    it('should decrypt encrypted data correctly', () => {
      const originalData = { username: 'testuser', token: 'secrettoken', email: 'test@example.com' };

      const encrypted = service.encrypt(originalData);
      const decrypted = service.decrypt(encrypted);

      expect(decrypted).toEqual(originalData);
    });

    it('should handle various data types', () => {
      const testCases = [
        { simple: 'string' },
        { number: 42 },
        { nested: { deep: { value: 'test' } } },
        { array: [1, 2, 3, 'test'] },
        { mixed: { arr: [1, 2], str: 'value', num: 99 } },
      ];

      testCases.forEach((testData) => {
        const encrypted = service.encrypt(testData);
        const decrypted = service.decrypt(encrypted);
        expect(decrypted).toEqual(testData);
      });
    });

    it('should throw error on invalid encrypted data', () => {
      const invalidEncrypted = 'invalid:data';

      expect(() => service.decrypt(invalidEncrypted)).toThrow();
    });

    it('should throw error on corrupted ciphertext', () => {
      const data = { test: 'data' };
      const encrypted = service.encrypt(data);

      // Corrupt the ciphertext
      const parts = encrypted.split(':');
      const corruptedCiphertext = parts[0] + ':' + 'deadbeef';

      expect(() => service.decrypt(corruptedCiphertext)).toThrow();
    });
  });

  describe('round-trip encryption', () => {
    it('should maintain data integrity through multiple encryption cycles', () => {
      const originalData = {
        credentials: {
          username: 'admin',
          password: 'complex$password123',
          apiKey: 'sk_test_abcd1234efgh5678',
        },
      };

      for (let i = 0; i < 5; i++) {
        const encrypted = service.encrypt(originalData);
        const decrypted = service.decrypt(encrypted);
        expect(decrypted).toEqual(originalData);
      }
    });
  });
});
