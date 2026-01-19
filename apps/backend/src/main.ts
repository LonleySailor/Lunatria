import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from 'express-session';
import * as passport from 'passport';
import Redis from 'ioredis';
import { CustomValidationPipe } from './responseStatus/pipeline/calendar.custompipeline.response';
import { RedisStore } from 'connect-redis';
import * as dotenv from 'dotenv';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as express from 'express';
import * as cookieParser from 'cookie-parser';
import { ConfigService } from './config/config.service';
import { APP_CONSTANTS } from './config/constants';

dotenv.config();
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  // Create Redis client
  const redis = new Redis(configService.getRedisUrl());

  const domainName = configService.getDomainName();
  const protocol = configService.getCorsProtocol();

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // allow non-browser tools like curl

      try {
        const hostname = new URL(origin).hostname;

        // Allow both the root domain and any subdomain
        if (
          hostname === domainName ||
          hostname.endsWith(`.${domainName}`) ||
          hostname === 'localhost'
        ) {
          return callback(null, true);
        }
      } catch (e) {
        // malformed origin
        return callback(new Error('Invalid origin'));
      }

      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  });

  app.set('trust proxy', APP_CONSTANTS.TRUST_PROXY);
  app.use(
    session({
      name: APP_CONSTANTS.SESSION_NAME,
      store: new RedisStore({ client: redis }),
      secret: configService.getPassportSecret(),
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: protocol === 'https', // REQUIRED for SameSite=None in production
        sameSite: 'none', // Allow cross-site cookies
        domain: domainName, // Allows cookies across subdomains
        path: '/',
        maxAge: configService.getSessionCookieMaxAge(),
      },
    }),
  );
  app.use(express.static(join(__dirname, '..', 'public')));
  app.use(cookieParser());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.useGlobalPipes(CustomValidationPipe);
  // Initialize Passport
  await app.use(passport.initialize());

  // Persist sessions across restarts
  await app.use(passport.session());

  const port = configService.getPort();
  await app.listen(port);
  console.log(`${APP_CONSTANTS.APP_NAME} running on port ${port}`);
}
bootstrap();
