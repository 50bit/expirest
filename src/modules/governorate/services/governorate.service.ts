import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CrudService } from 'src/common/crud/services/crud.service';

@Injectable()
export class GovernorateService extends CrudService {
  constructor(
    @InjectModel('governorates') public readonly model: Model<any>,
  ) {
    super(model);
  }
}