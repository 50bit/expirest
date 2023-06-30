import { IsBoolean, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class Login {
    @IsString()
    @ApiProperty()
    fullName: string;

    @IsBoolean()
    @ApiProperty()
    isAdmin: Boolean;

    @IsString()
    @ApiProperty({default:false})
    token: string;
}