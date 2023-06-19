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

    @Post('uploadMany/:id')
    @UseInterceptors(
        FilesInterceptor('image', 10, {
            dest: './uploads',
            storage: diskStorage({
                destination: function (req, file, cb) {
                    cb(null, './uploads');
                },
                filename: function (req, file, cb) {
                    cb(
                        null,
                        Date.now() +
                        'expirest' +
                        Date.now() +
                        '.' +
                        file.mimetype.split('/')[1],
                    );
                },
            }),
        }),
    )
    async uploadFiles(@UploadedFiles() files: any, @Param('id') id: string) {
        let fillOutput = {
            images: files.map((file: any) => {
                return { src: file.filename };
            }),
        };
        const oldItem = await this.service.findById(id);

        const updatedItem = await this.service.update(
            { _id: id },
            { ...fillOutput },
            { upsert: true },
        );
        if (oldItem && oldItem.images && oldItem.images.length > 0) {
            oldItem.images.forEach((image: any) => {
                fs.unlinkSync(`./uploads/${image.src}`);
            });
        }

        return updatedItem;
    }

    @Post('uploadFile/:id')
    @UseInterceptors(
        FileInterceptor('image', {
            dest: './uploads',
            storage: diskStorage({
                destination: function (req, file, cb) {
                    cb(null, './uploads');
                },
                filename: function (req, file, cb) {
                    cb(
                        null,
                        Date.now() +
                        'expirest' +
                        Date.now() +
                        '.' +
                        file.mimetype.split('/')[1],
                    );
                },
            }),
        }),
    )
    async uploadFile(@UploadedFile() file: any, @Param('id') id: string) {
        const oldItem = await this.service.findById(id);

        const updatedItem = await this.service.update(
            { _id: id },
            { image: file.filename },
            { upsert: true },
        );
        const updatesssdItem = await this.service.findById(new ObjectIdType(id), {
            image: file.filename,
        });
        if (oldItem && oldItem.image) {
            fs.unlinkSync(`./uploads/${oldItem.image}`);
        }

        return updatedItem;
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

    @Delete('del/:id')
    async deActivate(@Param('id') id: string) {
        return await this.service.deActivate(id);
    }
}