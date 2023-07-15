import { IsBoolean, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class Drug {
    @IsString()
    @ApiProperty()
    drug_name_en: String

    @IsString()
    @ApiProperty()
    drug_name_ar: String

    @IsNumber()
    @ApiProperty({type:Number,required:false})
    @Type(() => Number)
    price: Number

    @IsString()
    @ApiProperty()
    activeSubstance: String

    @IsString()
    @ApiProperty()
    category: String

    @IsString()
    @ApiProperty()
    barcode: String
}




