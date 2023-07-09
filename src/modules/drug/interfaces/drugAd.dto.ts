import { IsBoolean, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class DrugAd {
    @IsString()
    @ApiProperty()
    drug_name_en: String

    @IsString()
    @ApiProperty()
    drug_name_ar: String

    @IsNumber()
    @ApiProperty({type:Number,required:false})
    @Type(() => Number)
    packageUnits: Number

    @IsNumber()
    @ApiProperty({type:Number})
    @Type(() => Number)
    expiryDate: Number

    @IsNumber()
    @ApiProperty({type:Number})
    @Type(() => Number)
    availablePackages: Number

    @IsNumber()
    @ApiProperty({type:Number,required:false})
    @Type(() => Number)
    availablePackageUnits: Number

    @IsNumber()
    @ApiProperty({type:Number})
    @Type(() => Number)
    priceOnPackage: Number

    @IsNumber()
    @ApiProperty({type:Number})
    @Type(() => Number)
    discount: Number

    @IsNumber()
    @ApiProperty({type:Number})
    @Type(() => Number)
    sellingPrice: Number

    @IsString()
    @ApiProperty()
    notes: String

    @ApiProperty({
        type: [String],
        format: 'binary',
        required: true
    })
    drugAdImages: [Express.Multer.File]

    @IsString()
    @ApiProperty({ enum: ['pending', 'approved', 'rejected'], default: 'pending' })
    status: String
}




