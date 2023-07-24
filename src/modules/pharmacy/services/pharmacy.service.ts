import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CrudService } from 'src/common/crud/services/crud.service';
import { aggregationPipelineConfig } from '../schemas/pharmacy.schema';
import { aggregationMan } from 'src/common/utils/aggregationMan.utils';
import { ObjectIdType } from 'src/common/utils/db.utils';

@Injectable()
export class PharmacyService extends CrudService {
  constructor(
    @InjectModel('pharmacies') public readonly model: Model<any>,
    @InjectModel('users') public readonly usersModel: Model<any>,
  ) {
    super(model);
  }

  async updatePharmacy (_id,body,lang) {
    const pharamacy = await this.model
      .findOne({
        _id,
      })
    if (pharamacy) {
      await this.model.updateOne(
        { _id },
        {
          "$set": body,
        },
      );
      const pipelineConfig = aggregationPipelineConfig(lang)
      const pipeline = aggregationMan(pipelineConfig, { _id: new ObjectIdType(_id) })
      return (await this.model.aggregate(pipeline))[0];
    } else {
      throw new HttpException(
        'Pharamacy Not Found',
        HttpStatus.METHOD_NOT_ALLOWED,
      );
    }
  }

  async deActivatePharmacyAndUsers(_id,lang){
    const pharamacy = await this.model.findOne({
      _id
    })
    console.log(_id)
    if(pharamacy){
      await this.model.updateOne(
        { _id },
        {
          "$set": {
            "active":false
          },
        },
      );
    }
    const users = await this.usersModel.find({
      "pharmacyId":_id
    })
    console.log(users.length)
    if(users.length){
      await this.usersModel.updateMany(
        {"pharmacyId":_id},
        {
          "$set": {
            "active":false
          },
        }
      );
    }

    const pipelineConfig = aggregationPipelineConfig(lang)
    const pipeline = aggregationMan(pipelineConfig, { _id: new ObjectIdType(_id) })
    return (await this.model.aggregate(pipeline))[0];
  }
}
