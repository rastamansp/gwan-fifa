import 'reflect-metadata';
import { config as loadEnv } from 'dotenv';
import { resolve } from 'node:path';
// Carrega .env: da raiz do monorepo (../../.env) e do cwd, antes de ler env.
loadEnv({ path: resolve(process.cwd(), '../../.env') });
loadEnv();

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  // Prefixo global /api (REQ-F00-06).
  app.setGlobalPrefix(process.env.API_PREFIX ?? 'api');

  // Validação global: remove campos não declarados e converte tipos.
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true }),
  );

  // CORS restrito ao domínio web (NFR-SEC-04).
  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:5188',
  });

  const port = Number(process.env.PORT ?? process.env.API_PORT ?? 3015);
  await app.listen(port);
  new Logger('Bootstrap').log(`Gwan FIFA API em http://localhost:${port}/api`);
}

void bootstrap();
