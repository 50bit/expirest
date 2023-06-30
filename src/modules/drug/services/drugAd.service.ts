import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CrudService } from 'src/common/crud/services/crud.service';

@Injectable()
export class DrugAdService extends CrudService {
  constructor(
    @InjectModel('drug-ads') public readonly model: Model<any>,
  ) {
    super(model);
  }

  async approve(id){
    await this.model.updateOne({"_id":id},{"$set":{"status":'approved'}})
  }

  async reject(id){
    await this.model.updateOne({"_id":id},{"$set":{"status":'rejected'}})
  }
}