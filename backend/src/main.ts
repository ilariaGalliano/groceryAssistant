import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';

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

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security headers (XSS, clickjacking, MIME sniffing, etc.)
  app.use(helmet());

  // CORS — frontend autorizzato (locale + produzione)
  app.enableCors({
    origin: (origin, callback) => {
      callback(null, isOriginAllowed(origin));
    },
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 3600,
  });

  // Validazione e sanitizzazione globale degli input
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}

// Avvio locale/tradizionale. Su Vercel viene usato backend/api/index.ts.
if (!process.env.VERCEL) {
  void bootstrap();
}
