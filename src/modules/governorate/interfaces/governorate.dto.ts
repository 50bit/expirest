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

export class Governorate {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  governorate_name_ar: string;

  @ApiProperty()
  @IsString()
  governorate_name_en: string;
}