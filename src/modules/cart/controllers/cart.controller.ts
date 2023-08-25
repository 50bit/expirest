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
import { aggregationPipelineConfig } from 'src/modules/cart/schemas/cart.schema';
import { aggregationMan } from 'src/common/utils/aggregationMan.utils';
import { CartService } from '../services/cart.service';
import { CrudController } from 'src/common/crud/controllers/crud.controller';
import { AddItem } from '../interfaces/addItem.dto';
import { ObjectIdType } from 'src/common/utils/db.utils';
import { searchBody } from 'src/common/crud/interfaces/searchBody.dto';
import { clone, findIndex, get } from 'lodash'
@ApiTags('Cart')
@Controller('cart')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'))
export class CartController {
    constructor(public readonly cartService: CartService) {
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiCreatedResponse({})
    async getCart(@Request() req: any, @Headers() headers) {
        const body = {
            userId: new ObjectIdType(req.user.id),
            pharmacyId: new ObjectIdType(req.user.pharmacyId),
            checkedOut: false
        }
        const lang = (headers['accept-language'] == 'en' || headers['accept-language'] == 'ar'
            ? headers['accept-language']
            : 'multiLang');
        const pipelineConfig = aggregationPipelineConfig(lang)
        const pipeline = aggregationMan(pipelineConfig, body)
        return await this.cartService.aggregate(pipeline);
    }

    @Get('checked-out-transactions')
    @HttpCode(HttpStatus.OK)
    @ApiCreatedResponse({})
    async getCheckedOutTransactions(@Request() req: any, @Headers() headers) {
        const body = {
            pharmacyId: req.user.pharmacyId,
            checkedOut: true
        }
        const lang = (headers['accept-language'] == 'en' || headers['accept-language'] == 'ar'
            ? headers['accept-language']
            : 'multiLang');
        const pipelineConfig = aggregationPipelineConfig(lang)
        const pipeline = aggregationMan(pipelineConfig, body)
        return await this.cartService.aggregate(pipeline);
    }

    @Post('add-item')
    @HttpCode(HttpStatus.OK)
    @ApiCreatedResponse({})
    async addItemToCart(@Request() req: any, @Headers() headers, @Body() body: AddItem) {
        body["userId"] = req.user.id;
        body["pharmacyId"] = req.user.pharmacyId;
        body["checkedOut"] = false;
        const lang = (headers['accept-language'] == 'en' || headers['accept-language'] == 'ar'
            ? headers['accept-language']
            : 'multiLang');

        return await this.cartService.addItemToCart(body, lang)
    }

    @Post('checkout')
    @HttpCode(HttpStatus.OK)
    @ApiCreatedResponse({})
    async checkout(@Request() req: any, @Headers() headers) {
        const { pharmacyId, id } = req.user;
        const lang = (headers['accept-language'] == 'en' || headers['accept-language'] == 'ar'
            ? headers['accept-language']
            : 'multiLang');

        return await this.cartService.checkout(pharmacyId, id, lang)
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @ApiCreatedResponse({})
    async delete(@Param('id') id: string) {
        return await this.cartService.delete(id);
    }
}