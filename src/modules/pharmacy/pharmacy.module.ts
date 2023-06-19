import { Module } from '@nestjs/common';
import { PharmacyController } from './controllers/pharmacy.controller';
import { PharmacyService } from './services/pharmacy.service';

@Module({
  controllers: [PharmacyController],
  providers: [PharmacyService]
})
export class PharmacyModule {}
