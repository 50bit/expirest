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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { aggregationPipelineConfig } from 'src/common/schemas/cities.schema';
import { aggregationMan } from 'src/common/utils/aggregationMan.utils';

@ApiTags('Cities')
@Controller('cities')
export class CityController {
  constructor(public readonly cityService: CityService) {
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getCities(@Request() req: any, @Headers() headers) {
    const lang = (headers['accept-language'] == 'en' || headers['accept-language'] == 'ar'
      ? headers['accept-language']
      : 'multiLang');
    const pipelineConfig = aggregationPipelineConfig(lang)
    const pipeline = aggregationMan(pipelineConfig, {})
    return await this.cityService.aggregate(pipeline);
  }
}