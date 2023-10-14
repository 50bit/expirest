import { Module } from '@nestjs/common';
import { ConfigService } from './services/config.service';

@Module({
  providers: [{
    provide: ConfigService,
    useValue: new ConfigService(`.env.${process.env.NODE_ENV || 'development'}`),
  }],
  exports: [ConfigService],
})
export class ConfigModule {}
