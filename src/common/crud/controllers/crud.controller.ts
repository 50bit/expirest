import { Body, Controller, Inject, Post, Type } from '@nestjs/common';
import { ICrudService } from '../interfaces/ICrudService.interface';
import { ICrudController } from '../interfaces/ICrudController.interface';


export function CrudController(service: ICrudService, prefix:string): Type<ICrudController<any>> {
    @Controller(prefix)
    class CrudControllerHost {
        @Inject(service) private readonly crudService;

        @Post()
        async create(@Body() createDto) {
            return
        }
    }

    return CrudControllerHost;
}