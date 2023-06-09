import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class Register {
  @IsString()
  @ApiProperty()
  fullName: string

  @IsEmail()
  @ApiProperty()
  email: string

  @IsString()
  @ApiProperty()
  phoneNumber: string

  @IsString()
  @ApiProperty()
  password: string

  @ApiProperty({
    type: String,
    format: 'binary',
    required: true
  })
  pharmacistId: Express.Multer.File
}