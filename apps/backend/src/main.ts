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

dotenv.config();
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const domain = process.env.DOMAIN;

  // Create Redis client
  const redis = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6380');
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // allow non-browser tools like curl

      try {
        const hostname = new URL(origin).hostname;

        // Allow both the root domain and any subdomain
        if (hostname === 'lunatria.com' || hostname.endsWith('.lunatria.com')) {
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

  app.set('trust proxy', true);
  app.use(
    session({
      name: 'LunatriaSession',
      store: new RedisStore({ client: redis }),
      secret: process.env.PASSPORT_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: true, // REQUIRED for SameSite=None
        sameSite: 'none', // Allow cross-site cookies
        domain: domain, // Allows cookies across subdomains
        path: '/',
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

  await app.listen(3000);
}
bootstrap();
