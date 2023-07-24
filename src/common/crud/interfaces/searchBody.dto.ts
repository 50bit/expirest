import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class searchBody {
  @ApiProperty({required:false,default:{}})
  @IsObject()
  search: {};

  @ApiProperty({required:false,default:{}})
  @IsObject()
  options: {};

}