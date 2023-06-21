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
import { GovernorateService } from '../services/governorate.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Governorates')
@Controller('governorates')
export class GovernorateController {
  constructor(public readonly governorateService: GovernorateService) {
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getGovernorates(@Request() req: any) {
    return await this.governorateService.find({});
  }

}