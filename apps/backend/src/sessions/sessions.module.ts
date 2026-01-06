import { Module } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { SessionSerializer } from './session.serializer';
import { MongooseModule } from '@nestjs/mongoose/dist/mongoose.module';
import { userSchema } from 'src/users/users.schema';
import { SessionController } from './sessions.controller';
import { DATABASE_CONSTANTS } from 'src/config/constants';

@Module({
  imports: [MongooseModule.forFeature([{ name: DATABASE_CONSTANTS.SCHEMAS.USER, schema: userSchema }])],
  controllers: [SessionController],
  providers: [SessionsService, SessionSerializer],
  exports: [SessionsService, SessionSerializer],
})
export class SessionsModule {}
