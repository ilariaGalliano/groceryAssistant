import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { Express } from 'express';

const server: Express = express();
let app: any;

async function createApp() {
  const nestApp = await NestFactory.create(AppModule, new ExpressAdapter(server));

  // Security headers (XSS, clickjacking, MIME sniffing, etc.)
  nestApp.use(helmet());

  // CORS — frontend autorizzato (locale + produzione)
  nestApp.enableCors({
    origin: [
      'http://localhost:4200',
      process.env.FRONTEND_URL || '',
    ].filter(Boolean),
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 3600,
  });

  // Validazione e sanitizzazione globale degli input
  nestApp.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await nestApp.init();
  return nestApp;
}

// Per Vercel serverless
export default async function handler(req: any, res: any) {
  if (!app) {
    app = await createApp();
  }
  server(req, res);
}

// Per sviluppo locale
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  createApp().then(async (nestApp) => {
    await nestApp.listen(process.env.PORT ?? 3000);
    console.log(`🚀 Server running on http://localhost:${process.env.PORT ?? 3000}`);
  });
}
