import {
    Controller,
    HttpStatus,
    Get,
    Request,
    HttpCode,
    Headers,
    UseGuards,
    Post,
    Body,
    Query,
    Put,
    Delete,
    Param,
} from '@nestjs/common'; import { PharmacyService } from '../services/pharmacy.service';
import { aggregationPipelineConfig } from '../schemas/pharmacy.schema';
import { aggregationMan } from 'src/common/utils/aggregationMan.utils';
import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { Pharmacy } from '../interfaces/pharmacy.dto';
import { AuthGuard } from '@nestjs/passport';
import { CrudController } from 'src/common/crud/controllers/crud.controller';
import { searchBody } from 'src/common/crud/interfaces/searchBody.dto';
import { PharmacyUpdate } from '../interfaces/pharmacyUpdate.dto';
import { ObjectIdType } from 'src/common/utils/db.utils';
@ApiTags('Pharmacies')
@Controller('pharmacy')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'))
export class PharmacyController {
    constructor(public readonly pharmacyService: PharmacyService) {
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiCreatedResponse({
        type: [Pharmacy],
    })
    async getPharmacies(@Request() req: any, @Headers() headers) {
        const lang = (headers['accept-language'] == 'en' || headers['accept-language'] == 'ar'
            ? headers['accept-language']
            : 'multiLang');
        const pipelineConfig = aggregationPipelineConfig(lang)
        const pipeline = aggregationMan(pipelineConfig, {})
        return await this.pharmacyService.aggregate(pipeline);
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @ApiCreatedResponse({
        type: Pharmacy,
    })
    async getById(@Param('id') id: string, @Headers() headers,@Request() req: any) {
        const lang = (headers['accept-language'] == 'en' || headers['accept-language'] == 'ar'
            ? headers['accept-language']
            : 'multiLang');
        const userId = req.user.id
        return this.pharmacyService.getPharmacyById(id,userId,lang)
        
    }

    @Post('search')
    @HttpCode(HttpStatus.OK)
    @ApiCreatedResponse({
        type: [Pharmacy],
    })
    async search(@Body() body: searchBody, @Headers() headers) {
        const lang = (headers['accept-language'] == 'en' || headers['accept-language'] == 'ar'
            ? headers['accept-language']
            : 'multiLang');
        const pipelineConfig = aggregationPipelineConfig(lang)
        const pipeline = aggregationMan(pipelineConfig, body.search || {}, body.options || {})
        return await this.pharmacyService.aggregate(pipeline);
    }

    @Put()
    @ApiCreatedResponse({
        type: Pharmacy,
    })
    @ApiBody({
        type: PharmacyUpdate,
    })
    @HttpCode(HttpStatus.OK)
    async UpdatePharmacy(@Request() req, @Body() body: PharmacyUpdate, @Headers() headers) {
        const lang = (headers['accept-language'] == 'en' || headers['accept-language'] == 'ar'
            ? headers['accept-language']
            : 'multiLang');

        const pharamacyId = req.user.pharmacyId;
        return await this.pharmacyService.updatePharmacy(pharamacyId, body, lang);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @ApiCreatedResponse({
        type: Pharmacy,
    })
    async delete(@Param('id') id: string, @Headers() headers) {
        const lang = (headers['accept-language'] == 'en' || headers['accept-language'] == 'ar'
            ? headers['accept-language']
            : 'multiLang');
        return await this.pharmacyService.deActivatePharmacyAndUsers(id,lang);
    }
}
