import {
    Controller,
    Post,
    Body,
    Put,
    Param,
    HttpStatus,
    HttpException,
    Get,
    UseGuards,
    Request,
    Query,
    HttpCode,
    Headers,
} from '@nestjs/common';
import { DeliveryZonesService } from '../services/delivery-zones.service';
import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { aggregationPipelineConfig } from 'src/modules/delivery-zones/schemas/delivery-zones.schema';
import { aggregationMan } from 'src/common/utils/aggregationMan.utils';
import { CrudController } from 'src/common/crud/controllers/crud.controller';
import { searchBody } from 'src/common/crud/interfaces/searchBody.dto';

import { clone } from 'lodash'
import { ObjectIdType } from 'src/common/utils/db.utils';

@ApiTags('Delivery Zones')
@Controller('delivery-zones')
export class DeliveryZonesController  {
    constructor(public readonly deliveryZonesService: DeliveryZonesService) {
    }

    @Post("search")
    @HttpCode(HttpStatus.OK)
    async searchDeliveryZones(@Request() req: any, @Headers() headers, @Body() body: searchBody) {
        const lang = (headers['accept-language'] == 'en' || headers['accept-language'] == 'ar'
            ? headers['accept-language']
            : 'multiLang');
        const { search, options } = clone(body)

        const pipelineConfig = aggregationPipelineConfig(lang)
        const pipeline = aggregationMan(pipelineConfig, search, options)
        return await this.deliveryZonesService.aggregate(pipeline);
    }
}