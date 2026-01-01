import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Credential, CredentialSchema } from './credentials.schema';
import { CredentialsService } from './credentials.service';
import { EncryptionService } from './encryption/encryption.service';
import { CredentialsController } from './credentials.controller';
import { AuthModule } from 'src/auth/auth.module';
import { SessionsModule } from 'src/sessions/sessions.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Credential.name, schema: CredentialSchema },
    ]),
    AuthModule,
    SessionsModule,
    UsersModule,
  ],
  controllers: [CredentialsController],
  providers: [CredentialsService, EncryptionService],
  exports: [CredentialsService],
})
export class CredentialsModule {}
