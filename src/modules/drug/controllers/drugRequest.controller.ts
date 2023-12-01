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
import { aggregationMan } from 'src/common/utils/aggregationMan.utils';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { DrugRequestService } from '../services/drugRequest.service';
import { ObjectIdType } from 'src/common/utils/db.utils';
import { DrugRequest } from '../interfaces/drugRequest.dto';
import { DrugRequestUpdate } from '../interfaces/drugRequestUpdate.dto';
import { aggregationPipelineConfig } from '../schemas/drugRequest.schema';
import { searchBody } from 'src/common/crud/interfaces/searchBody.dto';
import { clone, findIndex,get } from 'lodash'
@ApiTags('Drug Request')
@Controller('drug-request')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'))
export class DrugRequestController {
    constructor(public readonly drugRequestService: DrugRequestService) {
    }

    @Post()
    @HttpCode(HttpStatus.OK)
    async create(@Request() req: any,@Body() body: DrugRequest,@Headers() headers) {
        const pharmacyId = req.user.pharmacyId
        body['pharmacyId'] = new ObjectIdType(pharmacyId)
        const userId = req.user.id
        const lang = (headers['accept-language'] == 'en' || headers['accept-language'] == 'ar'
        ? headers['accept-language']
        : 'multiLang');
        return await this.drugRequestService.createRequest(body,lang,userId);
    }

    @Post('add-to-cart')
    @HttpCode(HttpStatus.OK)
    async createAndAddToCart(@Request() req: any,@Body() body: DrugRequest,@Headers() headers) {
        const pharmacyId = req.user.pharmacyId
        body['pharmacyId'] = new ObjectIdType(pharmacyId)
        const userId = req.user.id
        const lang = (headers['accept-language'] == 'en' || headers['accept-language'] == 'ar'
        ? headers['accept-language']
        : 'multiLang');
        return await this.drugRequestService.createAndAddToCart(body,lang,userId);
    }

    @Put(':id')
    @HttpCode(HttpStatus.OK)
    async updateDrugRequest(@Request() req: any,@Body() body: DrugRequestUpdate,@Headers() headers,@Param('id') id: string) {
        const pharmacyId = req.user.pharmacyId
        body['pharmacyId'] = new ObjectIdType(pharmacyId)
        const lang = (headers['accept-language'] == 'en' || headers['accept-language'] == 'ar'
        ? headers['accept-language']
        : 'multiLang');
        return await this.drugRequestService.updateDrugRequest(id,body,lang);
    }

    @Get('approve/:id')
    @HttpCode(HttpStatus.OK)
    async approve(@Param('id') id: string, @Headers() headers) {
        const lang = (headers['accept-language'] == 'en' || headers['accept-language'] == 'ar'
            ? headers['accept-language']
            : 'multiLang');

        return this.drugRequestService.approve(id,lang)
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
        return (await this.drugRequestService.aggregate(pipeline))[0] || {};
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    async getDrugRequests(@Request() req: any, @Headers() headers) {
        const lang = (headers['accept-language'] == 'en' || headers['accept-language'] == 'ar'
            ? headers['accept-language']
            : 'multiLang');

        const userId = req.user.id
        const pipelineConfig = aggregationPipelineConfig(lang)
        const pipeline = aggregationMan(pipelineConfig, {})
        const allRequests =  await this.drugRequestService.aggregate(pipeline);
        for(const request of allRequests){
            request['isItemInCart'] = await this.drugRequestService.isItemInCart(request._id,userId)
        }
        return allRequests;

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
    async delete(@Headers() headers,@Param('id') id: string) {
        const lang = (headers['accept-language'] == 'en' || headers['accept-language'] == 'ar'
            ? headers['accept-language']
            : 'multiLang');
        return await this.drugRequestService.deleteDrugRequest(id,lang);
    }

    @Post("search")
    @HttpCode(HttpStatus.OK)
    async searchDrugAds(@Request() req: any, @Headers() headers, @Body() body: searchBody) {
        const lang = (headers['accept-language'] == 'en' || headers['accept-language'] == 'ar'
            ? headers['accept-language']
            : 'multiLang');
        const userId = req.user.id
        const {search,options} = clone(body)
        const pharmacyId = req.user.pharmacyId
        if(search.sent){
            search['pharmacyId'] = new ObjectIdType(pharmacyId)
            delete search.sent
        }

        const pipelineConfig = aggregationPipelineConfig(lang)
        //if(search.recieved) search['status'] = 'approved'
        const pipeline = aggregationMan(pipelineConfig, search,options)
        if(search.recieved){
            const pharmacyId = req.user.pharmacyId
            
            const drugAdLookupIndex = findIndex((pipeline),(lookup)=>{
                return lookup.$lookup && lookup.$lookup.from === 'drug-ads'
            })
            if(drugAdLookupIndex >= 0){
                const pipelineCopy = clone(pipeline)
                if(pipelineCopy){
                    pipelineCopy.push({
                        "$match": {
                          "drugAdId.pharmacyId._id": new ObjectIdType(pharmacyId)
                        }
                      })
                    delete search.recieved
			//console.log(JSON.stringify(pipelineCopy))
                    return await this.drugRequestService.aggregate(pipelineCopy);
                }
            }
        }
        const allRequests = await this.drugRequestService.aggregate(pipeline);
        //console.log("test",JSON.stringify(pipeline))
        await this.drugRequestService.aggregate(pipeline);
        for(const request of allRequests){
            request['isItemInCart'] = await this.drugRequestService.isItemInCart(request._id,userId)
        }
        return allRequests;
    }
}
