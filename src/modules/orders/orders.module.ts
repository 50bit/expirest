import { Module } from '@nestjs/common';
import { OrdersController } from './controllers/orders.controller';
import { OrdersService } from './services/orders.service';
import { ordersSchema } from './schemas/orders.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
    controllers: [OrdersController],
    providers: [OrdersService],
    imports:[
        MongooseModule.forFeature([
            { name: 'orders', schema: ordersSchema }
        ])
    ]
})
export class OrdersModule {}
