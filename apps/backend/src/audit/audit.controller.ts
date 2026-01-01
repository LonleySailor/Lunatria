// src/audit/audit.controller.ts
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { AdminGuard } from 'src/auth/guards/admin.guard';

@Controller('audit')
@UseGuards(AdminGuard) // You must be logged in
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  async getAuditLogs(
    @Query('userId') userId?: string,
    @Query('service') service?: string,
    @Query('status') status?: 'success' | 'fail',
    @Query('limit') limit = '100',
  ) {
    return this.auditService.findLogs(
      userId,
      service,
      status,
      parseInt(limit, 10),
    );
  }
}
