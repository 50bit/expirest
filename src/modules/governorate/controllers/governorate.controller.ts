import {
  Controller,
  HttpStatus,
  Get,
  Request,
  HttpCode,
  Headers,
} from '@nestjs/common';
import { GovernorateService } from '../services/governorate.service';
import { ApiTags } from '@nestjs/swagger';
import { aggregationMan } from 'src/common/utils/aggregationMan.utils';
import { aggregationPipelineConfig } from 'src/common/schemas/governorates.schema';

@ApiTags('Governorates')
@Controller('governorates')
export class GovernorateController {
  constructor(public readonly governorateService: GovernorateService) {
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getGovernorates(@Request() req: any, @Headers() headers) {
    const lang = (headers['accept-language'] == 'en' || headers['accept-language'] == 'ar'
      ? headers['accept-language']
      : 'multiLang');
    const pipelineConfig = aggregationPipelineConfig(lang)
    const pipeline = aggregationMan(pipelineConfig, {})
    return await this.governorateService.aggregate(pipeline);
  }
}