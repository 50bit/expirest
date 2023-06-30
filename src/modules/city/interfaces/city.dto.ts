import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class City {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  governorateId: string;

  @ApiProperty()
  @IsString()
  city_name_ar: string;

  @ApiProperty()
  @IsString()
  city_name_en: string;
}