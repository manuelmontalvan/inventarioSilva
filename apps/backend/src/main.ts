import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import * as crypto from 'crypto';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

if (!(global as any).crypto) {
  (global as any).crypto = crypto;
}
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const isProd = process.env.NODE_ENV === 'production';

  app.enableCors({
    origin: isProd
      ? ['https://inventario-silva.vercel.app']
      : ['http://localhost:3000'],
    credentials: true,
  });

  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });
  app.setGlobalPrefix('api');

  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
  await app.listen(port);
}

bootstrap();
