import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AdminService, RegisterCredentialBody } from './admin.service';
import { AdminGuard } from 'src/auth/guards/admin.guard';
import { AUTH_CONSTANTS } from 'src/config/constants';

@Controller(AUTH_CONSTANTS.CONTROLLERS.ADMIN)
@UseGuards(AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get(AUTH_CONSTANTS.ENDPOINTS.ADMIN_SERVICES)
  getServices() {
    return this.adminService.getSsoServices();
  }

  @Get(AUTH_CONSTANTS.ENDPOINTS.ADMIN_USERS_WITHOUT_CREDENTIAL)
  getUsersWithoutCredential(@Param('service') service: string) {
    return this.adminService.getUsersWithoutCredential(service);
  }

  @Post(AUTH_CONSTANTS.ENDPOINTS.ADMIN_REGISTER_CREDENTIAL)
  registerCredential(@Body() body: RegisterCredentialBody, @Req() req: any) {
    const adminUserId = req.session.passport.user;
    return this.adminService.registerCredential(body, adminUserId);
  }
}
