import { IsBoolean, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class DrugSearch {
    @IsString()
    @ApiProperty()
    keyword: String
}




