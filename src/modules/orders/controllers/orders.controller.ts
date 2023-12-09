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
import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { aggregationPipelineConfig } from 'src/modules/orders/schemas/orders.schema';
import { aggregationMan } from 'src/common/utils/aggregationMan.utils';
import { OrdersService } from '../services/orders.service';
import { ObjectIdType } from 'src/common/utils/db.utils';
import { clone, findIndex, get, map, reduce, forEach } from 'lodash'
import { PharmacyService } from 'src/modules/pharmacy/services/pharmacy.service';
import { aggregationPipelineConfig  as pharmacyPipelineConfig } from 'src/modules/pharmacy/schemas/pharmacy.schema';

@ApiTags('Orders')
@Controller('orders')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'))
export class OrdersController {
    constructor(public readonly orderService: OrdersService,
        public readonly pharmacyService: PharmacyService) {
    }

    @Put(":id")
    @HttpCode(HttpStatus.OK)
    @ApiCreatedResponse({})
    async updateState(@Request() req: any, @Headers() headers, @Body() body: any, @Param('id') id: string) {
        const lang = (headers['accept-language'] == 'en' || headers['accept-language'] == 'ar'
            ? headers['accept-language']
            : 'multiLang');
        await this.orderService.update({ _id: new ObjectIdType(id) }, { ...body })
        const pipelineConfig = aggregationPipelineConfig(lang)
        const pipeline = aggregationMan(pipelineConfig, { _id: new ObjectIdType(id) })
        return (await this.orderService.aggregate(pipeline))[0];
    }

    @Get("")
    @HttpCode(HttpStatus.OK)
    async getAllOrders(@Request() req: any, @Headers() headers) {
        const lang = (headers['accept-language'] == 'en' || headers['accept-language'] == 'ar'
            ? headers['accept-language']
            : 'multiLang');
        const search = {}
        const pipelineConfig = aggregationPipelineConfig(lang)
        const pipeline = aggregationMan(pipelineConfig, search)

        const result = await this.orderService.aggregate(pipeline);
        for (const res of result) {
            res["count"] = res.drugRequests.length || 0;
            res["total"] = reduce(map(res.drugRequests, (dr) => dr.total), function (sum, n) {
                return sum + n;
            }, 0) || 0;
        }

        return result
    }

    @Get("purchases")
    @HttpCode(HttpStatus.OK)
    async ordersPurchases(@Request() req: any, @Headers() headers) {
        const lang = (headers['accept-language'] == 'en' || headers['accept-language'] == 'ar'
            ? headers['accept-language']
            : 'multiLang');
        const search = {}
        const pharmacyId = req.user.pharmacyId
        search['pharmacyId'] = new ObjectIdType(pharmacyId)

        const pipelineConfig = aggregationPipelineConfig(lang)
        const pipeline = aggregationMan(pipelineConfig, search)
       
        const result = await this.orderService.aggregate(pipeline);
        for(const res of result){
            res["count"] = res.drugRequests.length || 0;
            res["total"] = reduce(map(res.drugRequests,(dr)=>dr.total), function(sum, n) {
                return sum + n;
            }, 0) || 0;

	    res["totalBeforeDiscount"] = reduce(map(res.drugRequests,(dr)=>(dr.discount ? dr.total / ( 1 - (dr.discount/100)) : dr.total )), function(sum, n) {
                 return sum + n;
             }, 0) || 0;

	    // console.log(res)
            
            if(res.drugRequests && res.quantity){
                forEach(res.drugRequests,(drugRequest)=>{
                    const dr = findIndex(res.quantity,(el)=> String(el.drugRequestId) == String(drugRequest._id))
                    if(dr >= 0 && res.quantity[dr]){
                        drugRequest.drugAdId.availablePackages = res.quantity[dr].packages || 0
                        drugRequest.drugAdId.availablePackageUnits = res.quantity[dr].packageUnits || 0
                        delete drugRequest.packages
                        delete drugRequest.packageUnits
                    }
                })
                delete res.quantity
            }
            if(res.quantity == null) delete res.quantity
        }

        return result
    }

    @Get("sales")
    @HttpCode(HttpStatus.OK)
    async ordersSales(@Request() req: any, @Headers() headers) {
        const lang = (headers['accept-language'] == 'en' || headers['accept-language'] == 'ar'
            ? headers['accept-language']
            : 'multiLang');
        const search = {}
        const pharmacyId = req.user.pharmacyId

        const pipelineConfig = aggregationPipelineConfig(lang)
        const pipeline = aggregationMan(pipelineConfig, search)

        const requestLookupIndex = findIndex((pipeline), (lookup) => {
            return lookup.$lookup && lookup.$lookup.from === 'drug-requests'
        })
        if (requestLookupIndex >= 0) {
            if (get(pipeline[requestLookupIndex], '$lookup.pipeline[1].$lookup.pipeline[1].$lookup.pipeline[0].$match.$expr.$and'))
                pipeline[requestLookupIndex].$lookup.pipeline[1].$lookup.pipeline[1].$lookup.pipeline[0].$match.$expr.$and.push({ pharmacyId: new ObjectIdType(pharmacyId) })
        }

        pipeline.push({
            $project: {
                _id: 1,
                pharmacyId: 1,
                status: 1,
                drugRequests: {
                    $filter: {
                        input: "$drugRequests",
                        as: "drugRequest",
                        cond: { $eq: ["$$drugRequest.drugAdId.pharmacyId._id", new ObjectIdType(pharmacyId)] }
                    }
                },
                orderId: 1
            }
        })
        pipeline.push({
            "$match": {
                "drugRequests": {
                    "$ne": []
                }
            }
        })
        const result = await this.orderService.aggregate(pipeline);
        for (const res of result) {
            res["count"] = res.drugRequests.length || 0;
            res["total"] = reduce(map(res.drugRequests, (dr) => dr.total), function (sum, n) {
                return sum + n;
            }, 0) || 0;

            let totalWithService = res.total
            let serviceCost = 0;

            if (totalWithService <= 250) {
                serviceCost = 5
                totalWithService += serviceCost;
            }
            if (totalWithService > 250) {
                serviceCost = parseFloat(((totalWithService * 2) / 100).toFixed(2));
                totalWithService += serviceCost;
            }
            res['totalWithService'] = totalWithService;
            res['serviceCost'] = serviceCost;

            if(res.drugRequests.length){
                const phPipelineConfig = pharmacyPipelineConfig(lang)
                const pharmacyPipeline = aggregationMan(phPipelineConfig, { _id: new ObjectIdType(res.drugRequests[0].pharmacyId) })
                res.pharmacyId = (await this.pharmacyService.aggregate(pharmacyPipeline))[0];
            }

            if (res.drugRequests && res.quantity) {
                forEach(res.drugRequests, (drugRequest) => {
                    const dr = findIndex(res.quantity, (el) => String(el.drugRequestId) == String(drugRequest._id))
                    if (dr >= 0 && res.quantity[dr]) {
                        drugRequest.drugAdId.availablePackages = res.quantity[dr].packages || 0
                        drugRequest.drugAdId.availablePackageUnits = res.quantity[dr].packageUnits || 0
                        delete drugRequest.packages
                        delete drugRequest.packageUnits
                    }
                })
                delete res.quantity
            }
            if (res.quantity == null) delete res.quantity
        }

        return { result }
    }
}
