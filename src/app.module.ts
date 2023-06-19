import { Inject, MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { ConfigService } from './common/config/services/config.service';
import { loggerMiddleware } from './common/middlewares/logger.middleware';
import { ConfigModule } from './common/config/config.module';
import { ModulesModule } from './modules/modules.module';

@Module({
  imports: [CommonModule, AuthModule, ModulesModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'ConfigService',
      useValue: new ConfigService(`.env.${process.env.NODE_ENV}`),
    }
  ]
})
export class AppModule {
  static port: string | number;
  static isDev: boolean;
  
  constructor(@Inject('ConfigService') private readonly config) {
    AppModule.port = process.env.PORT || config.get('PORT');
    AppModule.isDev = process.env.NODE_ENV === "development" ? true : false;
  }

  // DOC: https://docs.nestjs.com/middleware
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(loggerMiddleware)
      .forRoutes({ path: '/', method: RequestMethod.ALL });
  }
}
