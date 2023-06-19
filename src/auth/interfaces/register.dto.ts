import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class RegisterPayload {
  @ApiProperty({ required: true })
  @IsString()
  phoneNumber!: string;

  @ApiProperty({ required: true })
  @IsEmail()
  email!: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  fullname!: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  address!: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @MinLength(5)
  password!: string;

  @ApiProperty({ default: false })
  @IsOptional()
  @IsBoolean()
  isSysAdmin!: string;
}