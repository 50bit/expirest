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
import { DrugAdService } from '../services/drugAd.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { ObjectIdType } from 'src/common/utils/db.utils';

@ApiTags('Drug Ad')
@Controller('drug-ad')
export class DrugAdsController {
    constructor(public readonly drugAdService: DrugAdService) {
    }

    @Post('')
    @HttpCode(HttpStatus.OK)
    @UseInterceptors(
        FileFieldsInterceptor([
            { name: 'images', maxCount: 5 }
        ], {
            dest: './uploads',
            storage: diskStorage({
                destination: function (req, file, cb) {
                    cb(null, './uploads');
                },
                filename: function (req, file, cb) {
                    cb(
                        null,
                        'expirest' +
                        '-' +
                        file.originalname +
                        '-' +
                        Date.now() +
                        '.' +
                        file.mimetype.split('/')[1],
                    );
                },
            }),
        }),
    )
    async create(@UploadedFiles() files: { images?: [Express.Multer.File] }, @Body() body: any) {
        let images: any = files.images.map((file: any) => {
            return file.filename;
        })
        body['images'] = images
        body['pharmacyId'] = new ObjectIdType(body.pharmacyId)
        return await this.drugAdService.create(body);
    }

    @Get('approve/:id')
    @HttpCode(HttpStatus.OK)
    async approve(@Param('id') id: string, @Headers() headers) {
        const lang = (headers['accept-language'] == 'en' || headers['accept-language'] == 'ar'
            ? headers['accept-language']
            : 'multiLang');
        const pipelineConfig = aggregationPipelineConfig(lang)
        const pipeline = aggregationMan(pipelineConfig, {})
        await this.drugAdService.approve(id);
        return await this.drugAdService.aggregate(pipeline);
    }

    @Get('reject/:id')
    @HttpCode(HttpStatus.OK)
    async reject(@Param('id') id: string, @Headers() headers) {
        const lang = (headers['accept-language'] == 'en' || headers['accept-language'] == 'ar'
            ? headers['accept-language']
            : 'multiLang');
        const pipelineConfig = aggregationPipelineConfig(lang)
        const pipeline = aggregationMan(pipelineConfig, {})
        await this.drugAdService.reject(id);
        return await this.drugAdService.aggregate(pipeline);
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    async getDrugAds(@Request() req: any, @Headers() headers) {
        const lang = (headers['accept-language'] == 'en' || headers['accept-language'] == 'ar'
            ? headers['accept-language']
            : 'multiLang');
        const pipelineConfig = aggregationPipelineConfig(lang)
        const pipeline = aggregationMan(pipelineConfig, {})
        return await this.drugAdService.aggregate(pipeline);
    }
}