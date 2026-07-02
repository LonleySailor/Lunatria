import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { UsersModule } from 'src/users/users.module';
import { CredentialsModule } from 'src/credentials/credentials.module';
import { SessionsModule } from 'src/sessions/sessions.module';
import { AuthModule } from 'src/auth/auth.module';
import { ConfigModule } from 'src/config/config.module';
import { ProxyModule } from 'src/proxy/proxy.module';

@Module({
  imports: [
    UsersModule,
    CredentialsModule,
    SessionsModule,
    AuthModule,
    ConfigModule,
    ProxyModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
