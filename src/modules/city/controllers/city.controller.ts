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
import { CityService } from '../services/city.service';
import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { aggregationPipelineConfig } from 'src/modules/city/schemas/cities.schema';
import { aggregationMan } from 'src/common/utils/aggregationMan.utils';
import { City } from '../interfaces/city.dto';
import { CrudController } from 'src/common/crud/controllers/crud.controller';
import { searchBody } from 'src/common/crud/interfaces/searchBody.dto';

@ApiTags('Cities')
@Controller('cities')
export class CityController{
  constructor(public readonly cityService: CityService) {
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiCreatedResponse({
    type: [City],
  })
  async getCities(@Request() req: any, @Headers() headers) {
    const lang = (headers['accept-language'] == 'en' || headers['accept-language'] == 'ar'
      ? headers['accept-language']
      : 'multiLang');
    const pipelineConfig = aggregationPipelineConfig(lang)
    const pipeline = aggregationMan(pipelineConfig, {})
    return await this.cityService.aggregate(pipeline);
  }

  @Post('search')
  @HttpCode(HttpStatus.OK)
  @ApiCreatedResponse({
    type: [City],
  })
  async search(@Body() body: searchBody, @Headers() headers) {
    const lang = (headers['accept-language'] == 'en' || headers['accept-language'] == 'ar'
      ? headers['accept-language']
      : 'multiLang');
    const pipelineConfig = aggregationPipelineConfig(lang)
    const pipeline = aggregationMan(pipelineConfig, body.search || {}, body.options || {})
    return await this.cityService.aggregate(pipeline);
  }
}