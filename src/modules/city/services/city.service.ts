import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CrudService } from 'src/common/crud/services/crud.service';

@Injectable()
export class CityService extends CrudService {
  constructor(
    @InjectModel('cities') public readonly model: Model<any>,
  ) {
    super(model);
  }
}