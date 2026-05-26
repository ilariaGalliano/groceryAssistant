import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from '../src/app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { type Request, type Response } from 'express';
import serverless from 'serverless-http';

let cachedHandler: ReturnType<typeof serverless> | null = null;

const allowedOrigins = [
  process.env.FRONTEND_URL || '',
  process.env.FRONTEND_PREVIEW_URL || '',
].filter(Boolean);

const isOriginAllowed = (origin?: string): boolean => {
  if (!origin) {
    return true;
  }

  if (process.env.NODE_ENV !== 'production' && origin === 'http://localhost:4200') {
    return true;
  }

  if (allowedOrigins.includes(origin)) {
    return true;
  }

  return false;
};

const bootstrap = async () => {
  const expressApp = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));

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
  return serverless(expressApp);
};

export default async function handler(req: Request, res: Response) {
  if (!cachedHandler) {
    cachedHandler = await bootstrap();
  }

  return cachedHandler(req, res);
}
