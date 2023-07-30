import { Module } from '@nestjs/common';
import { PharmacyModule } from './pharmacy/pharmacy.module';
import { CityModule } from './city/city.module';
import { GovernorateModule } from './governorate/governorate.module';
import { DrugModule } from './drug/drug.module';
import { CartModule } from './cart/cart.module';
import { DeliveryZonesModule } from './delivery-zones/delivery-zones.module';

@Module({
  imports: [PharmacyModule, CityModule, GovernorateModule, DrugModule, CartModule, DeliveryZonesModule]
})
export class ModulesModule {}
