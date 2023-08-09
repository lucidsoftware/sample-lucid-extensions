import { NestFactory } from '@nestjs/core';
import { join } from 'path';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as cookieParser from 'cookie-parser';
import { AccessMiddleware } from './middleware/access.middleware';
import { AppConfig } from './configuration/app.config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets(join(__dirname, '..', 'assets'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');
  app.enableCors();

  app.use(cookieParser());
  app.use(new AccessMiddleware().use);

  const config = app.get(AppConfig);
  const port = config.port;

  await app.listen(port);
}

bootstrap();
