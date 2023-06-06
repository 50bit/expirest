import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '../config/configService/config.service';

const config = new ConfigService(`.env.${process.env.NODE_ENV}`);
@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.MONGODB_URI || config.get('MONGODB_URI'),
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        socketTimeoutMS: parseInt(config.get('TIMEOUT')),
        serverSelectionTimeoutMS: parseInt(config.get('TIMEOUT')),
      },
    ),
  ],
})
export class DatabaseModule {}