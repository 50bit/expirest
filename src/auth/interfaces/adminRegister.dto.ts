import { IsBoolean, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AdminRegisterDTO {
    pharmacy: PharmacyDTO;
    user: UserDTO;
}

class PharmacyDTO {
    @IsString()
    @ApiProperty()
    name: string

    @IsString()
    @ApiProperty()
    phoneNumber: string

    @IsString()
    @ApiProperty()
    governorateId: string

    @IsString()
    @ApiProperty()
    cityId: string

    @IsString()
    @ApiProperty()
    address: string
}



class UserDTO {
    @IsString()
    @ApiProperty()
    fullName: string

    @IsString()
    @ApiProperty()
    email: string

    @IsString()
    @ApiProperty()
    phoneNumber: string

    @IsString()
    @ApiProperty()
    password: string

    @IsBoolean()
    @ApiProperty({ required: false })
    isAdmin: boolean

    @IsBoolean()
    @ApiProperty({ required: false })
    activatedByEmail: boolean
}