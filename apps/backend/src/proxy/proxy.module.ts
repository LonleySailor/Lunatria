import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ProxyController } from './proxy.controller';
import { ProxyService } from './proxy.service';
import { SessionsModule } from 'src/sessions/sessions.module';
import { UsersModule } from 'src/users/users.module';
import { JellyfinController } from './jellyfin/jellyfin.controller';
import { JellyfinService } from './jellyfin/jellyfin.service';
import { CredentialsModule } from 'src/credentials/credentials.module';
import { RadarrController } from './radarr/radarr.controller';
import { RadarrService } from './radarr/radarr.service';
import { AuditModule } from 'src/audit/audit.module';
import { SonarrController } from './sonarr/sonarr.controller';
import { SonarrService } from './sonarr/sonarr.service';

@Module({
  imports: [
    HttpModule,
    SessionsModule,
    UsersModule,
    CredentialsModule,
    AuditModule,
  ],
  controllers: [
    ProxyController,
    JellyfinController,
    RadarrController,
    SonarrController,
  ],
  providers: [ProxyService, JellyfinService, RadarrService, SonarrService],
})
export class ProxyModule { }
