import { ApiProperty } from '@nestjs/swagger';
import {
    IsArray,
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class deliverZones {
  @ApiProperty()
  @IsString()
  cityId: string;

  @ApiProperty()
  @IsArray()
  deliveryZones: [String];
}