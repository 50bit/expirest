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
import { DrugService } from '../services/drug.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { aggregationPipelineConfig } from 'src/modules/drug/schemas/drugs.schema';
import { aggregationMan } from 'src/common/utils/aggregationMan.utils';

@ApiTags('Drug')
@Controller('drugs')
export class DrugController {
  constructor(public readonly drugsService: DrugService) {
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getDrugs(@Request() req: any, @Headers() headers) {
    const lang = (headers['accept-language'] == 'en' || headers['accept-language'] == 'ar'
      ? headers['accept-language']
      : 'multiLang');
    const pipelineConfig = aggregationPipelineConfig(lang)
    const pipeline = aggregationMan(pipelineConfig, {})
    return await this.drugsService.aggregate(pipeline);
  }
}