import {
  Controller,
  HttpStatus,
  Get,
  Request,
  HttpCode,
  Headers,
} from '@nestjs/common';
import { GovernorateService } from '../services/governorate.service';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { aggregationMan } from 'src/common/utils/aggregationMan.utils';
import { aggregationPipelineConfig } from 'src/modules/governorate/schemas/governorates.schema';
import { Governorate } from '../interfaces/governorate.dto';

@ApiTags('Governorates')
@Controller('governorates')
export class GovernorateController {
  constructor(public readonly governorateService: GovernorateService) {
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiCreatedResponse({
    type: [Governorate],
  })
  async getGovernorates(@Request() req: any, @Headers() headers) {
    const lang = (headers['accept-language'] == 'en' || headers['accept-language'] == 'ar'
      ? headers['accept-language']
      : 'multiLang');
    const pipelineConfig = aggregationPipelineConfig(lang)
    const pipeline = aggregationMan(pipelineConfig, {})
    return await this.governorateService.aggregate(pipeline);
  }
}