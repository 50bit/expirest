import {
    Controller,
    HttpStatus,
    Get,
    Request,
    HttpCode,
    Headers,
} from '@nestjs/common'; import { PharmacyService } from '../services/pharmacy.service';
import { aggregationPipelineConfig } from '../schemas/pharmacy.schema';
import { aggregationMan } from 'src/common/utils/aggregationMan.utils';
import { ApiTags } from '@nestjs/swagger';
@ApiTags('Pharmacies')
@Controller('pharmacy')
export class PharmacyController {
    constructor(public readonly pharmacyService: PharmacyService) {
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    async getGovernorates(@Request() req: any, @Headers() headers) {

        const lang = (headers['accept-language'] == 'en' || headers['accept-language'] == 'ar'
            ? headers['accept-language']
            : 'multiLang');
        const pipelineConfig = aggregationPipelineConfig(lang)
        const pipeline = aggregationMan(pipelineConfig, {})
        return await this.pharmacyService.aggregate(pipeline);
    }
}
