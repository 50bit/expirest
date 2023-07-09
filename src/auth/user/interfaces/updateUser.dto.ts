import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class UpdateUser {
  @IsString()
  @ApiProperty({required:false})
  fullName: string

  @IsEmail()
  @ApiProperty({required:false})
  email: string

  @IsString()
  @ApiProperty({required:false})
  phoneNumber: string

  @IsString()
  @ApiProperty({required:false})
  password: string
}