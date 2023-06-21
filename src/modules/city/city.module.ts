import { Module } from '@nestjs/common';
import { CityController } from './controllers/city.controller';
import { CityService } from './services/city.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CitiesSchema } from 'src/common/schemas/cities.schema';

@Module({
    controllers: [CityController],
    providers: [CityService],
    imports:[
        MongooseModule.forFeature([
            { name: 'cities', schema: CitiesSchema }
        ])
    ]
})
export class CityModule {}
