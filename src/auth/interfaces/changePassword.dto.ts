import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail, IsString,
} from 'class-validator';

export class ChangePassword {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  _id: string;

  @ApiProperty()
  @IsString()
  password: string;
}