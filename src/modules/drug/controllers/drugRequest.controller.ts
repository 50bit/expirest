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
    UseInterceptors,
    UploadedFiles,
    Res,
} from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { aggregationPipelineConfig } from 'src/modules/drug/schemas/drugs.schema';
import { aggregationMan } from 'src/common/utils/aggregationMan.utils';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { DrugRequestService } from '../services/drugRequest.service';
import { ObjectIdType } from 'src/common/utils/db.utils';

@ApiTags('Drug Ad')
@Controller('drug-ad')
export class DrugRequestController {
    constructor(public readonly drugRequestService: DrugRequestService) {
    }

    @Post('')
    @HttpCode(HttpStatus.OK)
    async create(@Body() body: any) {
        body['pharmacyId'] = new ObjectIdType(body.pharmacyId)
        return await this.drugRequestService.create(body);
    }

    @Get('approve/:id')
    @HttpCode(HttpStatus.OK)
    async approve(@Param('id') id: string, @Headers() headers) {
        const lang = (headers['accept-language'] == 'en' || headers['accept-language'] == 'ar'
            ? headers['accept-language']
            : 'multiLang');
        const pipelineConfig = aggregationPipelineConfig(lang)
        const pipeline = aggregationMan(pipelineConfig, {})
        await this.drugRequestService.approve(id);
        return await this.drugRequestService.aggregate(pipeline);
    }

    @Get('reject/:id')
    @HttpCode(HttpStatus.OK)
    async reject(@Param('id') id: string, @Headers() headers) {
        const lang = (headers['accept-language'] == 'en' || headers['accept-language'] == 'ar'
            ? headers['accept-language']
            : 'multiLang');
        const pipelineConfig = aggregationPipelineConfig(lang)
        const pipeline = aggregationMan(pipelineConfig, {})
        await this.drugRequestService.reject(id);
        return await this.drugRequestService.aggregate(pipeline);
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    async getDrugRequests(@Request() req: any, @Headers() headers) {
        const lang = (headers['accept-language'] == 'en' || headers['accept-language'] == 'ar'
            ? headers['accept-language']
            : 'multiLang');
        const pipelineConfig = aggregationPipelineConfig(lang)
        const pipeline = aggregationMan(pipelineConfig, {})
        return await this.drugRequestService.aggregate(pipeline);
    }
}