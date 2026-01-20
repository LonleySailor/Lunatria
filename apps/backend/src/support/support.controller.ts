import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { SupportService } from './support.service';
import { AuthenticatedGuard } from 'src/auth/guards/authenticated.guard';
import { AdminGuard } from 'src/auth/guards/admin.guard';
import { AUTH_CONSTANTS } from 'src/config/constants';

@Controller(AUTH_CONSTANTS.CONTROLLERS.SUPPORT)
export class SupportController {
  constructor(
    private readonly supportService: SupportService,
  ) { }

  @Get(AUTH_CONSTANTS.ENDPOINTS.SUPPORT_SERVICES)
  getServiceStatuses() {
    return this.supportService.getServiceStatuses();
  }

  @UseGuards(AuthenticatedGuard)
  @Get(AUTH_CONSTANTS.ENDPOINTS.SUPPORT_SERVICE_ACCESS)
  async getServiceAccess(@Request() req, @Query('service') service: string) {
    const access = await this.supportService.checkServiceAccess(req, service);
    if (access === true) return { access: true };
    return { access: false };
  }
  @UseGuards(AdminGuard)
  @Get(AUTH_CONSTANTS.ENDPOINTS.SUPPORT_IS_ADMIN)
  async isAdmin() {
    return { isAdmin: true };
  }
}
