import { Module } from '@nestjs/common';
import { PharmacyModule } from './pharmacy/pharmacy.module';

@Module({
  imports: [PharmacyModule]
})
export class ModulesModule {}
