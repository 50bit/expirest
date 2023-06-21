import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { UserSchema } from './user/schemas/user.schema';
import { UserService } from './user/services/user.service';
import { UserController } from './user/controllers/user.controller';
import { ConfigModule } from 'src/common/config/config.module';
import { ConfigService } from 'src/common/config/services/config.service';
import { AuthController } from './controllers/auth.controller';
import { JwtStrategy } from './strategy/jwt.strategy';
import { AuthService } from './services/auth.service';
import { PharmacySchema } from 'src/modules/pharmacy/schemas/pharmacy.schema';

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return {
          secret: configService.get('JWT_SECRET'),
          signOptions: {
            expiresIn: configService.get('JWT_EXPIRATION_TIME'),
          },
        };
      },
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: 'users', schema: UserSchema },
      { name: 'pharmacies', schema: PharmacySchema }
    ]),
  ],
  controllers: [AuthController, UserController],
  providers: [AuthService,
    JwtStrategy,
    UserService,
    {
      provide: 'ConfigService',
      useValue: new ConfigService(`.env.${process.env.NODE_ENV}`),
    }
  ],
  exports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    AuthService,
    UserService,
  ],
})
export class AuthModule {}