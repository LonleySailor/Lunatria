import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLog, AuditLogDocument } from './audit.schema';

@Injectable()
export class AuditService {
  constructor(
    @InjectModel(AuditLog.name) private auditModel: Model<AuditLogDocument>,
  ) {}

  async log(
    userId: string,
    service: string,
    status: 'success' | 'fail',
    reason?: string,
    path?: string,
  ) {
    await this.auditModel.create({ userId, service, status, reason, path });
  }
  // src/audit/audit.service.ts
  async findLogs(
    userId?: string,
    service?: string,
    status?: 'success' | 'fail',
    limit = 100,
  ) {
    const filter: any = {};
    if (userId) filter.userId = userId;
    if (service) filter.service = service;
    if (status) filter.status = status;

    return this.auditModel
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }
}
