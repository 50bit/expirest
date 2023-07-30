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
import { aggregationPipelineConfig } from 'src/modules/city/schemas/cities.schema';
import { aggregationMan } from 'src/common/utils/aggregationMan.utils';
import { CrudController } from 'src/common/crud/controllers/crud.controller';
import { searchBody } from 'src/common/crud/interfaces/searchBody.dto';

@ApiTags('Delivery Zones')
@Controller('delivery-zones')
export class DeliveryZonesController extends CrudController {
    constructor(public readonly deliveryZonesService: DeliveryZonesService) {
        super(deliveryZonesService)
    }
}