import { Module } from '@nestjs/common';
import { PharmacyModule } from './pharmacy/pharmacy.module';
import { CityModule } from './city/city.module';
import { GovernorateModule } from './governorate/governorate.module';

@Module({
  imports: [PharmacyModule, CityModule, GovernorateModule]
})
export class ModulesModule {}
