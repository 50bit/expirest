import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail, IsString,
} from 'class-validator';

export class AddUser {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  fullName: string;

  @ApiProperty()
  @IsString()
  phoneNumber: string;
}