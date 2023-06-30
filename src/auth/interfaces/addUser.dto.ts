import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
} from 'class-validator';

export class AddUser {
  @ApiProperty()
  @IsEmail()
  email: string;
}