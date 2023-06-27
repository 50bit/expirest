import { IsBoolean, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AdminRegisterDTO {
    @IsString()
    @ApiProperty()
    pharmacyName: string

    @IsString()
    @ApiProperty()
    PharmacyPhoneNumber: string

    @IsString()
    @ApiProperty()
    governorate_id: string

    @IsString()
    @ApiProperty()
    cityId: string

    @IsString()
    @ApiProperty()
    address: string

    @IsString()
    @ApiProperty()
    userFullName: string

    @IsString()
    @ApiProperty()
    email: string

    @IsString()
    @ApiProperty()
    userPhoneNumber: string

    @IsString()
    @ApiProperty()
    password: string

    @ApiProperty({ 
        type: 'string',
        format: 'binary',
        required: true 
    })
    pharmacyLiscence: Express.Multer.File

    @ApiProperty({ 
        type: 'string',
        format: 'binary',
        required: true 
    })
    pharmacistId: Express.Multer.File
}
