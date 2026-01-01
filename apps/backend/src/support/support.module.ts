import { Module } from '@nestjs/common';
import { SupportController } from './support.controller';
import { SupportService } from './support.service';
import { HttpModule } from '@nestjs/axios';
import { UsersModule } from 'src/users/users.module';
import { SessionsModule } from 'src/sessions/sessions.module';

@Module({
  imports: [HttpModule, UsersModule, SessionsModule],
  controllers: [SupportController],
  providers: [SupportService],
})
export class SupportModule {}
