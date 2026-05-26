import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from '../src/app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { type Request, type Response } from 'express';

const server = express();
let appReady = false;

const allowedOrigins = [
  process.env.FRONTEND_URL || '',
  process.env.FRONTEND_PREVIEW_URL || '',
].filter(Boolean);

const normalizeOrigin = (value: string): string => value.trim().replace(/\/$/, '');

const isOriginAllowed = (origin?: string): boolean => {
  if (!origin) {
    return true;
  }

  const normalizedOrigin = normalizeOrigin(origin);

  if (process.env.NODE_ENV !== 'production' && normalizedOrigin === 'http://localhost:4200') {
    return true;
  }

  const normalizedAllowedOrigins = allowedOrigins.map(normalizeOrigin);
  if (normalizedAllowedOrigins.includes(normalizedOrigin)) {
    return true;
  }

  return false;
};

const bootstrap = async () => {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

  app.use(helmet());

  app.enableCors({
    origin: (origin, callback) => {
      callback(null, isOriginAllowed(origin));
    },
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 3600,
  });

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
