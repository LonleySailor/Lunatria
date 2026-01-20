import { Module } from '@nestjs/common';
import { SupportController } from './support.controller';
import { SupportService } from './support.service';
import { HttpModule } from '@nestjs/axios';
import { UsersModule } from 'src/users/users.module';
import { SessionsModule } from 'src/sessions/sessions.module';
import { ConfigModule } from 'src/config/config.module';

@Module({
  imports: [HttpModule, UsersModule, SessionsModule, ConfigModule],
  controllers: [SupportController],
  providers: [SupportService],
})
export class SupportModule {}
