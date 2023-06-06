import { Body, Controller, Inject, Post, Type } from '@nestjs/common';
import { ICrudService } from '../interfaces/ICrudService.interface';



export function CrudService(service?: ICrudService): Type<ICrudService<any>> {
    class CrudServiceHost {
        @Inject(service) private readonly crudService;

        async create(body) {
            return
        }
    }

    return CrudServiceHost;
}