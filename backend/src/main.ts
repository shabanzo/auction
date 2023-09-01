import * as compression from 'compression';
import helmet from 'helmet';

import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: '*' })
  app.useGlobalPipes(new ValidationPipe({}))
  app.enableVersioning({ type: VersioningType.URI })
  app.use(helmet())
  app.use(compression())
  await app.listen(process.env.APP_PORT);
}
bootstrap();
