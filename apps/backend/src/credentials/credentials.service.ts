import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Credential, CredentialDocument } from './credentials.schema';
import { EncryptionService } from './encryption/encryption.service';

@Injectable()
export class CredentialsService {
  constructor(
    @InjectModel(Credential.name)
    private credentialModel: Model<CredentialDocument>,
    private readonly encryptionService: EncryptionService,
  ) { }

  async setCredential(
    userId: string,
    service: string,
    data: any,
  ): Promise<void> {
    const encryptedPayload = this.encryptionService.encrypt(data);
    await this.credentialModel.findOneAndUpdate(
      { userId, service },
      { encryptedPayload },
      { upsert: true, new: true },
    );
  }

  async getCredential(userId: string, service: string): Promise<any | null> {
    const record = await this.credentialModel.findOne({ userId, service });
    if (!record) return null;
    return this.encryptionService.decrypt(record.encryptedPayload);
  }

  async deleteCredential(userId: string, service: string): Promise<void> {
    await this.credentialModel.deleteOne({ userId, service });
  }
}
