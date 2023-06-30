import { Module } from '@nestjs/common';
import { PharmacyModule } from './pharmacy/pharmacy.module';
import { CityModule } from './city/city.module';
import { GovernorateModule } from './governorate/governorate.module';
import { DrugModule } from './drug/drug.module';

@Module({
  imports: [PharmacyModule, CityModule, GovernorateModule, DrugModule]
})
export class ModulesModule {}
