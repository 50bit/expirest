import { Module } from '@nestjs/common';
import { DeliveryZonesController } from './controllers/delivery-zones.controller';
import { DeliveryZonesService } from './services/delivery-zones.service';
import { MongooseModule } from '@nestjs/mongoose';
import { DeliveryZonesSchema } from './schemas/delivery-zones.schema';

@Module({
    controllers: [DeliveryZonesController],
    providers: [DeliveryZonesService],
    imports:[
        MongooseModule.forFeature([
            { name: 'delivery-zones', schema: DeliveryZonesSchema }
        ])
    ]
})
export class DeliveryZonesModule {}
