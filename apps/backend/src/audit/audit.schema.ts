import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AuditLogDocument = AuditLog & Document;

@Schema({ timestamps: true })
export class AuditLog {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  service: string;

  @Prop({ required: true })
  status: 'success' | 'fail';

  @Prop()
  reason?: string;

  @Prop()
  path?: string;

  @Prop({ default: Date.now, expires: 60 * 60 * 24 * 90 }) // 90 days
  createdAt: Date;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);

AuditLogSchema.index({ userId: 1, createdAt: -1 });
AuditLogSchema.index({ service: 1, createdAt: -1 });
