import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // elimina propiedades no definidas en DTO
      forbidNonWhitelisted: true, // lanza error si hay propiedades extra
      transform: true, // transforma payload a instancias de DTO
      transformOptions: {
      enableImplicitConversion: true,
    },
    }),
  );
   app.enableCors({
    origin: 'http://localhost:3000', // Cambia si tu frontend está en otro dominio o puerto
    credentials: true,
  });
  app.setGlobalPrefix('api');
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
