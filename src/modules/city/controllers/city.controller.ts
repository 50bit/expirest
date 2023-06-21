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

@ApiTags('Cities')
@Controller('cities')
export class CityController {
  constructor(public readonly cityService: CityService) {
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getCities(@Request() req: any) {
    return await this.cityService.find({});
  }

}