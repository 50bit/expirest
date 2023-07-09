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
import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { aggregationPipelineConfig } from 'src/modules/cart/schemas/cart.schema';
import { aggregationMan } from 'src/common/utils/aggregationMan.utils';
import { CartService } from '../services/cart.service';
import { CrudController } from 'src/common/crud/controllers/crud.controller';

@ApiTags('Cart')
@Controller('cart')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'))
export class CartController extends CrudController{
    constructor(public readonly cartService: CartService) {
        super(cartService)
    }

    @Post('add-item')
    @HttpCode(HttpStatus.OK)
    @ApiCreatedResponse({})
    async addItemToCart(@Request() req: any, @Headers() headers, @Body() body: any) {
        body["userId"] = req.user.id;
        await this.cartService.create(body)
        const lang = (headers['accept-language'] == 'en' || headers['accept-language'] == 'ar'
            ? headers['accept-language']
            : 'multiLang');
        const pipelineConfig = aggregationPipelineConfig(lang)
        const pipeline = aggregationMan(pipelineConfig, body)
        return await this.cartService.aggregate(pipeline);
    }
}