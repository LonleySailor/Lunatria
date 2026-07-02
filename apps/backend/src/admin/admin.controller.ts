import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  AdminService,
  GrantAccessBody,
  RegisterCredentialBody,
} from './admin.service';
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

  @Get(AUTH_CONSTANTS.ENDPOINTS.ADMIN_USERS_WITHOUT_ACCESS)
  getUsersWithoutAccess(@Param('service') service: string) {
    return this.adminService.getUsersWithoutAccess(service);
  }

  @Post(AUTH_CONSTANTS.ENDPOINTS.ADMIN_GRANT_ACCESS)
  grantAccess(@Body() body: GrantAccessBody) {
    return this.adminService.grantAccess(body);
  }

  @Get(AUTH_CONSTANTS.ENDPOINTS.ADMIN_USERS_WITH_ACCESS)
  getUsersWithAccess(@Param('service') service: string) {
    return this.adminService.getUsersWithAccess(service);
  }

  @Post(AUTH_CONSTANTS.ENDPOINTS.ADMIN_REVOKE_ACCESS)
  revokeAccess(@Body() body: GrantAccessBody) {
    return this.adminService.revokeAccess(body);
  }

  @Get(AUTH_CONSTANTS.ENDPOINTS.ADMIN_USERS_WITH_CREDENTIAL)
  getUsersWithCredential(@Param('service') service: string) {
    return this.adminService.getUsersWithCredential(service);
  }

  @Post(AUTH_CONSTANTS.ENDPOINTS.ADMIN_REVOKE_CREDENTIAL)
  revokeCredential(@Body() body: GrantAccessBody, @Req() req: any) {
    const adminUserId = req.session.passport.user;
    return this.adminService.revokeCredential(body, adminUserId);
  }

  @Get(AUTH_CONSTANTS.ENDPOINTS.ADMIN_USERS)
  getUsers(@Req() req: any) {
    return this.adminService.getUsers(req.session.passport.user);
  }

  @Post(AUTH_CONSTANTS.ENDPOINTS.ADMIN_DELETE_USER)
  deleteUser(@Body('targetUser') targetUser: string, @Req() req: any) {
    return this.adminService.deleteUser(targetUser, req.session.passport.user);
  }
}
