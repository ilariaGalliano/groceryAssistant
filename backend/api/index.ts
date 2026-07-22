import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from '../src/app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { type Request, type Response } from 'express';

const server = express();
let appReady = false;

const normalizeOrigin = (value: string): string => value.trim().replace(/\/+$/, '');

const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.FRONTEND_PREVIEW_URL,
  'capacitor://localhost',
]
  .filter((value): value is string => Boolean(value))
  .map(normalizeOrigin);

const isLocalDevelopmentOrigin = (origin: string): boolean => {
  try {
    const url = new URL(origin);
    if (!['http:', 'https:'].includes(url.protocol)) return false;
    return url.hostname === 'localhost' || url.hostname === '127.0.0.1';
  } catch {
    return false;
  }
};

const isOriginAllowed = (origin?: string): boolean => {
  if (!origin) return true; // client non-browser / server-to-server

  const normalizedOrigin = normalizeOrigin(origin);

  if (allowedOrigins.includes(normalizedOrigin)) {
    return true;
  }

  return process.env.NODE_ENV !== 'production' && isLocalDevelopmentOrigin(normalizedOrigin);
};

const bootstrap = async () => {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

  // CORS must be enabled BEFORE helmet and other middlewares
  app.enableCors({
    origin: (origin, callback) => {
      callback(null, isOriginAllowed(origin));
    },
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 3600,
  });

  app.use(helmet());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.init();
  appReady = true;
};

export default async function handler(req: Request, res: Response) {
  if (!appReady) {
    await bootstrap();
  }

  return server(req, res);
}
