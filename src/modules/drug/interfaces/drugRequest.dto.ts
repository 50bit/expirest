import { IsBoolean, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class DrugRequest {
    @IsString()
    @ApiProperty()
    drugAdId: String

    @IsNumber()
    @ApiProperty({type:Number,required:false})
    @Type(() => Number)
    packages: Number

    @IsNumber()
    @ApiProperty({type:Number,required:false})
    @Type(() => Number)
    packageUnits: Number

    @IsNumber()
    @ApiProperty({type:Number})
    @Type(() => Number)
    discount: Number

    @IsNumber()
    @ApiProperty({type:Number})
    @Type(() => Number)
    price: Number

    @IsNumber()
    @ApiProperty({type:Number})
    @Type(() => Number)
    total: Number
}




