import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CrudService } from 'src/common/crud/services/crud.service';

@Injectable()
export class DeliveryZonesService extends CrudService {
  constructor(
    @InjectModel('delivery-zones') public readonly model: Model<any>,
  ) {
    super(model);
  }

  async inDeliveryZone(query){
    const deliveryZone = await this.model.findOne(query)
    return deliveryZone ? true : false
  }

}