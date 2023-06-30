import { Module } from '@nestjs/common';
import { GovernorateController } from './controllers/governorate.controller';
import { GovernorateService } from './services/governorate.service';
import { GovernoratesSchema } from 'src/modules/governorate/schemas/governorates.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
    controllers: [GovernorateController],
    providers: [GovernorateService],
    imports: [
        MongooseModule.forFeature([
            { name: 'governorates', schema: GovernoratesSchema },
        ])
    ]
})
export class GovernorateModule { }
