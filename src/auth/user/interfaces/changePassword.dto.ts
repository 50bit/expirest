import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail, IsString,
} from 'class-validator';

export class ChangePassword {
  @ApiProperty()
  @IsString()
  password: string;
}