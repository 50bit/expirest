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
    Delete,
} from '@nestjs/common';
import { DeliveryZonesService } from '../services/delivery-zones.service';
import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { aggregationPipelineConfig } from 'src/modules/city/schemas/cities.schema';
import { aggregationMan } from 'src/common/utils/aggregationMan.utils';
import { CrudController } from 'src/common/crud/controllers/crud.controller';
import { searchBody } from 'src/common/crud/interfaces/searchBody.dto';
import {clone} from 'lodash'
import { deliverZones } from '../interfaces/delivery-zones.dto';
@ApiTags('Delivery Zones')
@Controller('delivery-zones')
export class DeliveryZonesController  {
    constructor(public readonly deliveryZonesService: DeliveryZonesService) {
    }

    @Post()
    @HttpCode(HttpStatus.OK)
    async create(@Body() body: deliverZones) {
        return await this.deliveryZonesService.create(body);
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

    @Put(':id')
    async put(@Param('id') id: string, @Body() body: any) {
        return await this.deliveryZonesService.updateById(id, body);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        return await this.deliveryZonesService.delete(id);
    }
}