import { ArrayNotEmpty, IsArray, IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export class UpdateDrugAd {
    @IsString()
    @ApiProperty({ required: false })
    drug_name_en: String

    @IsString()
    @ApiProperty({ required: false })
    drug_name_ar: String

    @IsNumber()
    @ApiProperty({ type: Number, required: false })
    @Type(() => Number)
    packageUnits: Number

    @IsNumber()
    @ApiProperty({ type: Number, required: false })
    @Type(() => Number)
    expiryDate: Number

    @IsNumber()
    @ApiProperty({ type: Number, required: false })
    @Type(() => Number)
    availablePackages: Number

    @IsNumber()
    @ApiProperty({ type: Number, required: false })
    @Type(() => Number)
    availablePackageUnits: Number

    @IsNumber()
    @ApiProperty({ type: Number, required: false })
    @Type(() => Number)
    priceOnPackage: Number

    @IsNumber()
    @ApiProperty({ type: Number, required: false })
    @Type(() => Number)
    discount: Number

    @IsNumber()
    @ApiProperty({ type: Number, required: false })
    @Type(() => Number)
    sellingPrice: Number

    @IsString()
    @ApiProperty({ required: false })
    notes: String

    @ApiProperty({
        type: [String],
        format: 'binary',
        required: false
    })
    drugAdImages: [Express.Multer.File]


    @ApiProperty({ isArray:true, type: [String]})
    imagesToDelete: String[];
}




