import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';

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
