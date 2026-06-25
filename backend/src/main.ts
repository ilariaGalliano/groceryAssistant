import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';

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

  // Consenti richieste da app Capacitor/Cordova (Android e iOS)
  if (
    normalizedOrigin.startsWith('capacitor://') ||
    normalizedOrigin.startsWith('ionic://') ||
    normalizedOrigin === 'http://localhost' ||
    normalizedOrigin === 'https://localhost'
  ) {
    return true;
  }

  if (process.env.NODE_ENV !== 'production' && normalizedOrigin === 'http://localhost:4200') {
    return true;
  }

  const normalizedAllowedOrigins = allowedOrigins.map(normalizeOrigin);
  if (normalizedAllowedOrigins.includes(normalizedOrigin)) {
    return true;
  }

  return false;
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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

  // Security headers (XSS, clickjacking, MIME sniffing, etc.)
  app.use(helmet());

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
