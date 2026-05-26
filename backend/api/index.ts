import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

const server = express();

export const createNestServer = async (expressInstance: express.Express) => {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressInstance));

  app.use(helmet());

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:4200',
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
  return app;
};

createNestServer(server);

export default server;
