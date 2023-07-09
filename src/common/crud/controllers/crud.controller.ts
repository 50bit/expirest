import {
    Query,
    Get,
    Delete,
    Param,
    HttpCode,
    HttpStatus,
    Post,
    Body,
    Put,
    UseInterceptors,
    UploadedFiles,
    UploadedFile,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import { ObjectIdType } from '../../utils/db.utils';

export class CrudController {
    service: any;
    constructor(services: any) {
        this.service = services;
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    async findAll(@Query() options: any) {
        return await this.service.findAll({}, options);
    }

    @Post('search')
    @HttpCode(HttpStatus.OK)
    async search(@Body() body: any, @Query() options: any) {
        return await this.service.findAll(body, options);
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async findOne(@Param('id') id: string) {
        return await this.service.findById(id);
    }

    @Put(':id')
    async put(@Param('id') id: string, @Body() body: any) {
        return await this.service.updateById(id, body);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        return await this.service.delete(id);
    }

}