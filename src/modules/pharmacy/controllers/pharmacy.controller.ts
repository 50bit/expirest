import {
    Controller,
    HttpStatus,
    Get,
    Request,
    HttpCode,
    Headers,
    UseGuards,
} from '@nestjs/common'; import { PharmacyService } from '../services/pharmacy.service';
import { aggregationPipelineConfig } from '../schemas/pharmacy.schema';
import { aggregationMan } from 'src/common/utils/aggregationMan.utils';
import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { Pharmacy } from '../interfaces/pharmacy.dto';
import { AuthGuard } from '@nestjs/passport';
import { CrudController } from 'src/common/crud/controllers/crud.controller';
@ApiTags('Pharmacies')
@Controller('pharmacy')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'))
export class PharmacyController extends CrudController{
    constructor(public readonly pharmacyService: PharmacyService) {
        super(pharmacyService)
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiCreatedResponse({
        type: [Pharmacy],
    })
    async getPharmacies(@Request() req: any, @Headers() headers) {
        const lang = (headers['accept-language'] == 'en' || headers['accept-language'] == 'ar'
            ? headers['accept-language']
            : 'multiLang');
        const pipelineConfig = aggregationPipelineConfig(lang)
        const pipeline = aggregationMan(pipelineConfig, {})
        return await this.pharmacyService.aggregate(pipeline);
    }
}
