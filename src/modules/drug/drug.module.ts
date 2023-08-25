import { Module } from '@nestjs/common';
import { DrugController } from './controllers/drug.controller';
import { DrugService } from './services/drug.service';
import { MongooseModule } from '@nestjs/mongoose';
import { DrugsSchema } from './schemas/drugs.schema';
import { DrugAdSchema } from './schemas/drugAd.schema';
import { DrugAdService } from './services/drugAd.service';
import { DrugAdsController } from './controllers/drugAd.controller';
import { DrugRequestSchema } from './schemas/drugRequest.schema';
import { DrugRequestService } from './services/drugRequest.service';
import { DrugRequestController } from './controllers/drugRequest.controller';
import { CartsSchema } from '../cart/schemas/cart.schema';
import { CartModule } from '../cart/cart.module';
import { DeliveryZonesSchema } from '../delivery-zones/schemas/delivery-zones.schema';
import { DeliveryZonesService } from '../delivery-zones/services/delivery-zones.service';
import { PharmacySchema } from '../pharmacy/schemas/pharmacy.schema';

@Module({
    controllers: [DrugController,DrugAdsController,DrugRequestController],
    providers: [DrugService,DrugAdService,DrugRequestService,DeliveryZonesService],
    imports:[
        MongooseModule.forFeature([
            { name: 'drugs', schema: DrugsSchema },
            { name: 'drug-ads', schema: DrugAdSchema },
            { name: 'drug-requests', schema: DrugRequestSchema },
            { name: 'carts', schema: CartsSchema },
            { name: 'delivery-zones', schema: DeliveryZonesSchema },
            { name: 'pharmacies', schema: PharmacySchema },
        ])
    ]
})
export class DrugModule {}
