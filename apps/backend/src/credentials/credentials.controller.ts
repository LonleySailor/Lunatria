import {
  Controller,
  Post,
  Body,
  Delete,
  Param,
  UseGuards,
  Req,
  Patch,
  Get,
} from '@nestjs/common';
import { CredentialsService } from './credentials.service';
import { AdminGuard } from 'src/auth/guards/admin.guard';
import { UsersService } from 'src/users/users.service';
import { throwCredentialsException } from 'src/responseStatus/credentials.response';
import { throwException } from 'src/responseStatus/auth.response';
import { AUTH_CONSTANTS } from 'src/config/constants';

@Controller(AUTH_CONSTANTS.CONTROLLERS.CREDENTIALS)
@UseGuards(AdminGuard)
export class CredentialsController {
  constructor(
    private readonly credentialsService: CredentialsService,
    private readonly userService: UsersService,
  ) { }

  @Post('/add')
  async addCredential(@Req() req: any, @Body() body: any) {
    const service = body.service;
    const userId = await this.userService.getUserId(body.targetUser);
    if (!userId) throwException.Usernotfound();
    const doesCredentialExist = await this.credentialsService.getCredential(
      userId,
      service,
    );
    if (doesCredentialExist)
      throwCredentialsException.CredentialsAlreadyExist();
    return await this.credentialsService.setCredential(userId, service, body);
  }

  @Get(':service')
  async getCredential(@Param('service') service: string, @Req() req: any) {
    const userId = req.session.passport?.id;
    return this.credentialsService.getCredential(userId, service);
  }

  @Patch(':service')
  async updateCredential(
    @Param('service') service: string,
    @Req() req: any,
    @Body() body: any,
  ) {
    const userId = req.session.passport?.id;
    return this.credentialsService.setCredential(userId, service, body);
  }

  @Delete(':service')
  async deleteCredential(@Param('service') service: string, @Req() req: any) {
    const userId = req.session.passport?.id;
    return this.credentialsService.deleteCredential(userId, service);
  }
}
