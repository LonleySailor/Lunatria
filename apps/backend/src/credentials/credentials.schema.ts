import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CredentialDocument = Credential & Document;

@Schema({ timestamps: true })
export class Credential {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  service: string;

  @Prop({ required: true })
  encryptedPayload: string; // Encrypted JSON blob (AES-256)
}

export const CredentialSchema = SchemaFactory.createForClass(Credential);
