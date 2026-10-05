import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import express from 'express';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Express's default body-parser caps a JSON body at 100kb, which a
  // listing with a few resized photos (sent as base64 data URLs,
  // ~33% larger than the binary) blows straight through - raised here
  // since there's no file upload/CDN endpoint, just a string field.
  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  const developmentMode = process.env.DEVELOPMENT_MODE === 'true';
  const allowedOrigins = (process.env.FRONTEND_ORIGIN ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  app.enableCors({
    origin: developmentMode ? true : allowedOrigins,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
