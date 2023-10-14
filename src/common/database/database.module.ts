import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '../config/services/config.service';
const config = new ConfigService(`.env.${process.env.NODE_ENV || 'development'}`);
@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.MONGODB_URI || config.get('MONGODB_URI') || "mongodb://0.0.0.0:27017/expirest" ,
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