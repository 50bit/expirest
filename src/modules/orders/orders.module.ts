import { Module } from '@nestjs/common';
import { OrdersController } from './controllers/orders.controller';
import { OrdersService } from './services/orders.service';
import { ordersSchema } from './schemas/orders.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { PharmacyService } from '../pharmacy/services/pharmacy.service';
import { PharmacySchema } from '../pharmacy/schemas/pharmacy.schema';
import { UserSchema } from 'src/auth/user/schemas/user.schema';

@Module({
    controllers: [OrdersController],
    providers: [OrdersService, PharmacyService,],
    imports: [
        MongooseModule.forFeature([
            { name: 'orders', schema: ordersSchema },
            { name: 'pharmacies', schema: PharmacySchema},
            { name: 'users', schema: UserSchema}
        ])
    ]
})
export class OrdersModule { }
