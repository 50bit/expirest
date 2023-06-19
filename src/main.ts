import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';

import { setupSwagger } from './swagger';
import { AppModule } from './app.module';
import { loggerMiddleware } from './common/middlewares/logger.middleware';

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  const logger = new Logger('Main');
  const globalPrefix = '/api';
  
  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix(globalPrefix);
  app.use(helmet());
  app.use(loggerMiddleware);

  setupSwagger(app);

  await app.listen(AppModule.port);

  // for Hot Module Reload
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }

  // Log current url of app and documentation
  let baseUrl = app.getHttpServer().address().address;
  if (baseUrl === '0.0.0.0' || baseUrl === '::') {
    baseUrl = 'localhost';
  }
  const url = `http://${baseUrl}:${AppModule.port}${globalPrefix}`;
  logger.log(`Listening to ${url}`);
  if (AppModule.isDev) {
    logger.log(`API Documentation available at ${url}/docs`);
  }
}
bootstrap();