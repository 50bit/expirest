import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class Pharmacy {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  @Matches(/^01[0125][0-9]{8}$/gm)
  phoneNumber: string;

  @ApiProperty()
  @IsString()
  governorateId: string;

  @ApiProperty()
  @IsString()
  cityId: string;

  @ApiProperty()
  @IsString()
  address: string;

  @ApiProperty()
  @IsString()
  pharmacyLiscence: string;

  @ApiProperty()
  @IsString()
  pharmacistId: string;
}