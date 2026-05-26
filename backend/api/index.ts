import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from '../src/app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { type Request, type Response } from 'express';
import serverless from 'serverless-http';

let cachedHandler: ReturnType<typeof serverless> | null = null;

const bootstrap = async () => {
  const expressApp = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));

  app.use(helmet());

  app.enableCors({
    origin: ['http://localhost:4200', process.env.FRONTEND_URL || ''].filter(Boolean),
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
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
