import { NestFactory } from '@nestjs/core';
import { Catch, Logger, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';

import { setupSwagger } from './swagger';
import { AppModule } from './app.module';
import { loggerMiddleware } from './common/middlewares/logger.middleware';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { ErrorsInterceptor } from './common/interceptors/errors.interceptor';

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
  });

  app.useGlobalInterceptors(new TransformInterceptor(),new ErrorsInterceptor());


  const logger = new Logger('Main');
  const globalPrefix = '/api';

  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix(globalPrefix);
  app.use(helmet());
  app.use(loggerMiddleware);

  // @Catch(Error)
  // class Handler {
  //   catch(e: any, res: any) {
  //     console.log(e)
  //     logger.error(e);
  //   }
  // }

  // app.useGlobalFilters(new Handler());

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
    baseUrl = '0.0.0.0';
  }
  const url = `http://${baseUrl}:${AppModule.port}${globalPrefix}`;
  logger.log(`Listening to ${url}`);
  if (AppModule.isDev) {
    logger.log(`API Documentation available at ${url}/docs`);
  }
}
bootstrap();
