import { Test, TestingModule } from '@nestjs/testing';
import { CredentialsService } from './credentials.service';
import { EncryptionService } from './encryption/encryption.service';
import { getModelToken } from '@nestjs/mongoose';
import { Credential } from './credentials.schema';

describe('CredentialsService', () => {
  let service: CredentialsService;
  let encryptionService: EncryptionService;
  let mockCredentialModel: any;

  const mockUserId = '507f1f77bcf86cd799439011';
  const mockService = 'jellyfin';
  const mockCredentialData = {
    username: 'jellyfinuser',
    token: 'jellyfintoken123',
  };
  const mockEncryptedPayload = 'iv:encryptedhexstring';

  const mockEncryptionService = {
    encrypt: jest.fn(),
    decrypt: jest.fn(),
  };

  const mockCredentialRecord = {
    _id: '507f1f77bcf86cd799439012',
    userId: mockUserId,
    service: mockService,
    encryptedPayload: mockEncryptedPayload,
  };

  beforeEach(async () => {
    mockCredentialModel = {
      findOne: jest.fn(),
      findOneAndUpdate: jest.fn(),
      deleteOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CredentialsService,
        {
          provide: getModelToken(Credential.name),
          useValue: mockCredentialModel,
        },
        {
          provide: EncryptionService,
          useValue: mockEncryptionService,
        },
      ],
    }).compile();

    service = module.get<CredentialsService>(CredentialsService);
    encryptionService = module.get<EncryptionService>(EncryptionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('setCredential', () => {
    it('should encrypt and store credential', async () => {
      mockEncryptionService.encrypt.mockReturnValueOnce(mockEncryptedPayload);
      mockCredentialModel.findOneAndUpdate.mockResolvedValueOnce(mockCredentialRecord);

      await service.setCredential(mockUserId, mockService, mockCredentialData);

      expect(encryptionService.encrypt).toHaveBeenCalledWith(mockCredentialData);
      expect(mockCredentialModel.findOneAndUpdate).toHaveBeenCalledWith(
        { userId: mockUserId, service: mockService },
        { encryptedPayload: mockEncryptedPayload },
        { upsert: true, new: true },
      );
    });

    it('should update existing credential', async () => {
      const updatedData = { username: 'newuser', token: 'newtoken' };
      mockEncryptionService.encrypt.mockReturnValueOnce('iv:newhexstring');
      mockCredentialModel.findOneAndUpdate.mockResolvedValueOnce({
        ...mockCredentialRecord,
        encryptedPayload: 'iv:newhexstring',
      });

      await service.setCredential(mockUserId, mockService, updatedData);

      expect(encryptionService.encrypt).toHaveBeenCalledWith(updatedData);
      expect(mockCredentialModel.findOneAndUpdate).toHaveBeenCalled();
    });
  });

  describe('getCredential', () => {
    it('should retrieve and decrypt credential', async () => {
      mockCredentialModel.findOne.mockResolvedValueOnce(mockCredentialRecord);
      mockEncryptionService.decrypt.mockReturnValueOnce(mockCredentialData);

      const result = await service.getCredential(mockUserId, mockService);

      expect(result).toEqual(mockCredentialData);
      expect(mockCredentialModel.findOne).toHaveBeenCalledWith({ userId: mockUserId, service: mockService });
      expect(encryptionService.decrypt).toHaveBeenCalledWith(mockEncryptedPayload);
    });

    it('should return null when credential not found', async () => {
      mockCredentialModel.findOne.mockResolvedValueOnce(null);

      const result = await service.getCredential(mockUserId, mockService);

      expect(result).toBeNull();
      expect(encryptionService.decrypt).not.toHaveBeenCalled();
    });
  });

  describe('deleteCredential', () => {
    it('should delete credential by userId and service', async () => {
      mockCredentialModel.deleteOne.mockResolvedValueOnce({ deletedCount: 1 });

      await service.deleteCredential(mockUserId, mockService);

      expect(mockCredentialModel.deleteOne).toHaveBeenCalledWith({ userId: mockUserId, service: mockService });
    });

    it('should handle deletion of non-existent credential', async () => {
      mockCredentialModel.deleteOne.mockResolvedValueOnce({ deletedCount: 0 });

      // Should not throw, just silently succeed
      await expect(service.deleteCredential(mockUserId, 'nonexistent')).resolves.not.toThrow();
    });
  });
});
