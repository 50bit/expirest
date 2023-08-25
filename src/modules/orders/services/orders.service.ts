import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CrudService } from 'src/common/crud/services/crud.service';
import { aggregationPipelineConfig } from '../schemas/orders.schema';
import { aggregationMan } from 'src/common/utils/aggregationMan.utils';
import { ObjectIdType } from 'src/common/utils/db.utils';
import { forEach, get, random } from 'lodash'
import { aggregationPipelineConfig as pharmacyAggregationPipelineConfig } from '../../pharmacy/schemas/pharmacy.schema';
import { aggregationPipelineConfig as drugRequestAggregationPipelineConfig } from '../../drug/schemas/drugRequest.schema'
import { nanoid } from 'nanoid';

@Injectable()
export class OrdersService extends CrudService {
  constructor(
    @InjectModel('orders') public readonly model: Model<any>
  ) {
    super(model);
  }

}