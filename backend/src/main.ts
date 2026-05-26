import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security headers (XSS, clickjacking, MIME sniffing, etc.)
  app.use(helmet());

  // CORS — frontend autorizzato (locale + produzione)
  app.enableCors({
    origin: [
      'http://localhost:4200',
      process.env.FRONTEND_URL || '',
    ].filter(Boolean),
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
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
