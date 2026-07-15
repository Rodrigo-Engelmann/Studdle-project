import { NestFactory } from '@nestjs/core';
import 'reflect-metadata';
import { AppModule } from './app.module';
import { json, urlencoded } from 'express';
import cookieParser from 'cookie-parser';

import { join } from 'path';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Permite interpretar JSON do body
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true }));
    // habilitar cookie parser (necessário para req.cookies)
  app.use(cookieParser());

  
  // sistema pros tokens

  // CORS: habilitar credenciais para permitir cookies cross-site
  app.enableCors({
    origin: 'http://localhost:4200',
    credentials: true,
    methods: 'GET,POST,PUT,DELETE,PATCH',
  });

  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));


  await app.listen(3000);
}
bootstrap();
