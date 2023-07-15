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
import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { aggregationPipelineConfig } from 'src/modules/drug/schemas/drugs.schema';
import { aggregationMan } from 'src/common/utils/aggregationMan.utils';
import { CrudController } from 'src/common/crud/controllers/crud.controller';
import { ObjectIdType } from 'src/common/utils/db.utils';
import { clone } from 'lodash'
import { DrugSearch } from '../interfaces/drugSerach.dto';
import { Drug } from '../interfaces/drug.dto';
@ApiTags('Drugs')
@Controller('drugs')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'))
export class DrugController {
  constructor(public readonly drugsService: DrugService) {
  }

  @Get()
  @ApiCreatedResponse({
    type: [Drug],
  })
  @HttpCode(HttpStatus.OK)
  async getDrugs(@Request() req: any, @Headers() headers) {
    const lang = (headers['accept-language'] == 'en' || headers['accept-language'] == 'ar'
      ? headers['accept-language']
      : 'multiLang');
    const pipelineConfig = aggregationPipelineConfig(lang)
    const pipeline = aggregationMan(pipelineConfig, {})
    pipeline.push({ "$limit": 1000 })
    return await this.drugsService.aggregate(pipeline);
  }

  @Post("search")
  @ApiCreatedResponse({
    type: [Drug],
  })
  @HttpCode(HttpStatus.OK)
  async searchDrugs(@Headers() headers, @Body() body: DrugSearch) {
    const lang = (headers['accept-language'] == 'en' || headers['accept-language'] == 'ar'
      ? headers['accept-language']
      : 'multiLang');
    const search = clone(body)
    // let searchOptions = {"$text":{"$search":search.keyword}}
    let searchOptions ={$or: [
      { "drug_name_en": new RegExp(search.keyword, "gi") },
      { "drug_name_ar": new RegExp(search.keyword, "gi") },
    ]}
    const pipelineConfig = aggregationPipelineConfig(lang)
    let pipeline = aggregationMan(pipelineConfig, searchOptions)
    pipeline = [...pipeline,{ "$limit": 1000 }]
    return await this.drugsService.aggregate(pipeline);
  }
}