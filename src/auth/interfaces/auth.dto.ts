import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class Auth {
    @IsString()
    @ApiProperty()
    phoneNumber!: string;

    @IsString()
    @ApiProperty()
    password!: string;
}