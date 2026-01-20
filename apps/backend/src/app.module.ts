import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { SessionsModule } from './sessions/sessions.module';
import { SessionMiddleware } from './sessions/sessions.middleware';
import { ProxyModule } from './proxy/proxy.module';
import { CredentialsModule } from './credentials/credentials.module';
import { SupportModule } from './support/support.module';
import { RedisModule } from './redis/redis.module';
import { ConfigModule } from './config/config.module';
import { ConfigService } from './config/config.service';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.getMongodbUri(),
      }),
    }),
    RedisModule,
    UsersModule,
    AuthModule,
    SessionsModule,
    CredentialsModule,
    ProxyModule,
    SupportModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SessionMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL }); // Apply to all routes
  }
}
