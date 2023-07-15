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
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiCreatedResponse, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { aggregationPipelineConfig } from 'src/modules/drug/schemas/drugAd.schema';
import { aggregationMan } from 'src/common/utils/aggregationMan.utils';
import { DrugAdService } from '../services/drugAd.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { ObjectIdType } from 'src/common/utils/db.utils';
import fs from 'fs';
import { DrugAd } from '../interfaces/drugAd.dto';
import { clone, forEach, pickBy, identity, map, pick } from 'lodash';
import { UpdateDrugAd } from '../interfaces/updateDrugAd.dto';
@ApiTags('Drug Ad')
@Controller('drug-ad')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'))
export class DrugAdsController {
    constructor(public readonly drugAdService: DrugAdService) {
    }

    @Post('create')
    @HttpCode(HttpStatus.OK)
    @ApiCreatedResponse({
        type: DrugAd,
    })
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(
        FileFieldsInterceptor([
            { name: 'drugAdImages', maxCount: 5 }
        ]),
    )
    async create(@UploadedFiles() files: { drugAdImages?: [Express.Multer.File] }, @Body() body: DrugAd, @Request() req: any) {
        const pharmacyId = req.user.pharmacyId
        let drugAdImages: any = files.drugAdImages.map((file: any) => {
            return "drugAdImages/" + file.filename;
        })
        const drug = clone(body)
        drug['drugAdImages'] = drugAdImages
        drug['pharmacyId'] = new ObjectIdType(pharmacyId)
        if(!drug.availablePackageUnits && drug.availablePackages){
            drug['availablePackageUnits'] = drug.packageUnits ? drug.availablePackages * drug.packageUnits : drug.availablePackages 
        }
        return await this.drugAdService.create(drug);
    }

    @Get('approve/:id')
    @HttpCode(HttpStatus.OK)
    async approve(@Param('id') id: string, @Headers() headers) {
        const lang = (headers['accept-language'] == 'en' || headers['accept-language'] == 'ar'
            ? headers['accept-language']
            : 'multiLang');
        const pipelineConfig = aggregationPipelineConfig(lang)
        const pipeline = aggregationMan(pipelineConfig, { _id: new ObjectIdType(id) })
        await this.drugAdService.approve(id);
        return (await this.drugAdService.aggregate(pipeline))[0];
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

    @Put(':id')
    @HttpCode(HttpStatus.OK)
    @ApiCreatedResponse({
        type: DrugAd,
    })
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(
        FileFieldsInterceptor([
            { name: 'drugAdImages', maxCount: 5 }
        ]),
    )
    async updateDrugAd(@UploadedFiles() files: { drugAdImages?: [Express.Multer.File] }, @Request() req: any, @Headers() headers, @Param('id') id: string, @Body() body: UpdateDrugAd) {
        const pharmacyId = req.user.pharmacyId
        const lang = (headers['accept-language'] == 'en' || headers['accept-language'] == 'ar'
            ? headers['accept-language']
            : 'multiLang');
        let drugAdImages = []
        if (files.drugAdImages)
            drugAdImages = files.drugAdImages.map((file: any) => {
                return "drugAdImages/" + file.filename;
            })
        const drug = pickBy(pick(clone(body),[
            "packageUnits",
            "expiryDate",
            "availablePackages",
            "availablePackageUnits",
            "notes",
            "drugAdImages",
            "imagesToDelete"
        ]), identity);
        drug['drugAdImages'] = drugAdImages
        drug['pharmacyId'] = new ObjectIdType(pharmacyId)
        drug['imagesToDelete'] = Array.isArray(drug.imagesToDelete) ? drug.imagesToDelete : (drug.imagesToDelete ? drug.imagesToDelete.split(',') : [])
        return this.drugAdService.updateDrugAd({ id, pharmacyId, lang }, drug)
    }

    @Get("my-ads")
    @HttpCode(HttpStatus.OK)
    async getMyDrugAds(@Request() req: any, @Headers() headers,) {
        const pharmacyId = req.user.pharmacyId
        const lang = (headers['accept-language'] == 'en' || headers['accept-language'] == 'ar'
            ? headers['accept-language']
            : 'multiLang');
        const pipelineConfig = aggregationPipelineConfig(lang)
        const pipeline = aggregationMan(pipelineConfig, { pharmacyId: new ObjectIdType(pharmacyId) })
        return await this.drugAdService.aggregate(pipeline);
    }


    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    async delete(@Param('id') id: string) {
        return this.drugAdService.deactivate(id);
    }

    @Post("search")
    @HttpCode(HttpStatus.OK)
    async searchDrugAds(@Request() req: any, @Headers() headers, @Body() body: any) {
        const lang = (headers['accept-language'] == 'en' || headers['accept-language'] == 'ar'
            ? headers['accept-language']
            : 'multiLang');
        const search = clone(body)
        if(search.pharmacyId)
            search["pharmacyId"] =  new ObjectIdType(search.pharmacyId)
        const pipelineConfig = aggregationPipelineConfig(lang)
        const pipeline = aggregationMan(pipelineConfig, search)
        return await this.drugAdService.aggregate(pipeline);
    }
}