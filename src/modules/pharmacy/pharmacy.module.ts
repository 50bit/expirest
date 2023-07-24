import { Module } from '@nestjs/common';
import { PharmacyController } from './controllers/pharmacy.controller';
import { PharmacyService } from './services/pharmacy.service';
import { MongooseModule } from '@nestjs/mongoose';
import { PharmacySchema } from './schemas/pharmacy.schema';
import { UserSchema } from 'src/auth/user/schemas/user.schema';

@Module({
  controllers: [PharmacyController],
  providers: [PharmacyService],
  imports: [
    MongooseModule.forFeature([
      { name: 'pharmacies', schema: PharmacySchema },
      { name: 'users', schema: UserSchema },
    ])
  ]
})
export class PharmacyModule { }
