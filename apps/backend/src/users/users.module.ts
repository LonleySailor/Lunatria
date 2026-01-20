import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './users.controller';
import { userSchema } from './users.schema';
import { UsersService } from './users.service';
import { SessionsModule } from 'src/sessions/sessions.module';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from 'src/config/config.module';
import { DATABASE_CONSTANTS } from 'src/config/constants';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: DATABASE_CONSTANTS.SCHEMAS.USER, schema: userSchema }]),
    SessionsModule,
    HttpModule,
    ConfigModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
