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

@Module({
    controllers: [DrugController,DrugAdsController,DrugRequestController],
    providers: [DrugService,DrugAdService,DrugRequestService],
    imports:[
        MongooseModule.forFeature([
            { name: 'drugs', schema: DrugsSchema },
            { name: 'drug-ads', schema: DrugAdSchema },
            { name: 'drug-requests', schema: DrugRequestSchema }
        ])
    ]
})
export class DrugModule {}
