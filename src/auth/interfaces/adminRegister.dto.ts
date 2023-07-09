import { IsBoolean, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AdminRegister {
    @IsString()
    @ApiProperty()
    pharmacyName: string

    @IsString()
    @ApiProperty()
    PharmacyPhoneNumber: string

    @IsString()
    @ApiProperty()
    governorateId: string

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
        type: String,
        format: 'binary',
        required: true 
    })
    pharmacyLiscence: Express.Multer.File

    @ApiProperty({ 
        type: String,
        format: 'binary',
        required: true 
    })
    pharmacistId: Express.Multer.File
}
