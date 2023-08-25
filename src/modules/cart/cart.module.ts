import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CartsSchema } from './schemas/cart.schema';
import { CartService } from './services/cart.service';
import { CartController } from './controllers/cart.controller';
import { PharmacySchema } from '../pharmacy/schemas/pharmacy.schema';
import { PharmacyModule } from '../pharmacy/pharmacy.module';
import { DrugRequestSchema } from '../drug/schemas/drugRequest.schema';
import { DrugAdSchema } from '../drug/schemas/drugAd.schema';
import { DeliveryZonesSchema } from '../delivery-zones/schemas/delivery-zones.schema';
import { ordersSchema } from '../orders/schemas/orders.schema';

@Module({
    controllers: [CartController],
    providers: [CartService],
    imports:[
        MongooseModule.forFeature([
            { name: 'carts', schema: CartsSchema },
            { name: 'pharmacies', schema: PharmacySchema },
            { name: 'drug-requests', schema: DrugRequestSchema},
            { name: 'drug-ads', schema: DrugAdSchema},
            { name: 'delivery-zones', schema: DeliveryZonesSchema },
            { name: 'orders', schema: ordersSchema }
        ])
    ]
})
export class CartModule {}
