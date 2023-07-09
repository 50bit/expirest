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
    Delete,
} from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { aggregationPipelineConfig } from 'src/modules/drug/schemas/drugs.schema';
import { aggregationMan } from 'src/common/utils/aggregationMan.utils';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { DrugRequestService } from '../services/drugRequest.service';
import { ObjectIdType } from 'src/common/utils/db.utils';

@ApiTags('Drug Request')
@Controller('drug-request')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'))
export class DrugRequestController {
    constructor(public readonly drugRequestService: DrugRequestService) {
    }

    @Post('')
    @HttpCode(HttpStatus.OK)
    async create(@Request() req: any,@Body() body: any) {
        const pharmacyId = req.user.pharmacyId
        body['pharmacyId'] = new ObjectIdType(pharmacyId)
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


    @Get("my-requests")
    @HttpCode(HttpStatus.OK)
    async getMyDrugAds(@Request() req: any, @Headers() headers) {
        const pharmacyId = req.user.pharmacyId
        const lang = (headers['accept-language'] == 'en' || headers['accept-language'] == 'ar'
            ? headers['accept-language']
            : 'multiLang');
        const pipelineConfig = aggregationPipelineConfig(lang)
        const pipeline = aggregationMan(pipelineConfig, { pharmacyId: new ObjectIdType(pharmacyId) })
        return await this.drugRequestService.aggregate(pipeline);
    }


    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    async delete(@Param('id') id: string) {
        return await this.drugRequestService.delete(id);
    }

    @Post("search")
    @HttpCode(HttpStatus.OK)
    async searchDrugAds(@Request() req: any, @Headers() headers, @Body() body: any) {
        const lang = (headers['accept-language'] == 'en' || headers['accept-language'] == 'ar'
            ? headers['accept-language']
            : 'multiLang');
        const pipelineConfig = aggregationPipelineConfig(lang)
        const pipeline = aggregationMan(pipelineConfig, body)
        return await this.drugRequestService.aggregate(pipeline);
    }
}