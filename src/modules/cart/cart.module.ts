import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CartsSchema } from './schemas/cart.schema';
import { CartService } from './services/cart.service';
import { CartController } from './controllers/cart.controller';

@Module({
    controllers: [CartController],
    providers: [CartService],
    imports:[
        MongooseModule.forFeature([
            { name: 'carts', schema: CartsSchema }
        ])
    ]
})
export class CartModule {}
