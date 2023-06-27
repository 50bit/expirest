import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CrudService } from 'src/common/crud/services/crud.service';

@Injectable()
export class PharmacyService extends CrudService {
    constructor(
      @InjectModel('pharmacies') public readonly model: Model<any>,
    ) {
      super(model);
    }
  }
