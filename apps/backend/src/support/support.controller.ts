import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { SupportService } from './support.service';
import { AuthenticatedGuard } from 'src/auth/guards/authenticated.guard';
import { AdminGuard } from 'src/auth/guards/admin.guard';
import { UsersService } from 'src/users/users.service';

@Controller('support')
export class SupportController {
  constructor(
    private readonly supportService: SupportService,
    private readonly usersService: UsersService,
  ) { }

  @Get('services')
  getServiceStatuses() {
    return this.supportService.getServiceStatuses();
  }

  @UseGuards(AuthenticatedGuard)
  @Get('service-access')
  async getServiceAccess(@Request() req, @Query('service') service: string) {
    const access = await this.supportService.checkServiceAccess(req, service);
    if (access === true) return { access: true };
    return { access: false };
  }
  @UseGuards(AdminGuard)
  @Get('is-admin')
  async isAdmin() {
    return { isAdmin: true };
  }
}
