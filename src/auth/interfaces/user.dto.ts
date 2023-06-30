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

export class User {
  @ApiProperty()
  @IsString()
  @Matches(/^01[0125][0-9]{8}$/gm)
  phoneNumber: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  fullname: string;

  @ApiProperty({default:false })
  @IsBoolean()
  isAdmin: Boolean;

  @ApiProperty({default:false })
  @IsBoolean()
  activatedByEmail: Boolean;


  @ApiProperty()
  @IsString()
  pharmacyId: string;

  @ApiProperty({default:false })
  @IsBoolean()
  approved: Boolean;

  @ApiProperty()
  @IsNumber()
  verficationCode: Number;
}