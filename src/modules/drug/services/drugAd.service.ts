import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CrudService } from 'src/common/crud/services/crud.service';
import { forEach, clone } from 'lodash'
import fs from 'fs';
import { ObjectIdType } from 'src/common/utils/db.utils';
import { aggregationPipelineConfig } from '../schemas/drugAd.schema';
import { aggregationMan } from 'src/common/utils/aggregationMan.utils';
@Injectable()
export class DrugAdService extends CrudService {
  constructor(
    @InjectModel('drug-ads') public readonly model: Model<any>,
  ) {
    super(model);
  }

  async approve(id) {
    await this.model.updateOne({ "_id": id }, { "$set": { "status": 'approved' } })
  }

  async reject(id) {
    await this.model.updateOne({ "_id": id }, { "$set": { "status": 'rejected' } })
  }

  async deleteDrugAd(id) {
    const drugAd = await this.model.findOne({ _id: new ObjectIdType(id) })
    if (drugAd && drugAd.drugAdImages) {
      forEach(drugAd.drugAdImages, (path) => {
        if (fs.existsSync(path))
          fs.unlinkSync(`./uploads/${path}`);
      })
      return await this.model.deleteOne({ _id: id });
    } else {
      return new HttpException(
        'Drug ad is not found',
        HttpStatus.METHOD_NOT_ALLOWED,
      );
    }
  }

  async updateDrugAd(options, body) {
    const { id, pharmacyId, lang } = options;
    const drugAd = await this.model.findOne({ _id: new ObjectIdType(id), pharmacyId: new ObjectIdType(pharmacyId) })
    if (drugAd) {
      const images = [...body.drugAdImages, ...drugAd.drugAdImages]
      // update images 
      // delete unused images
      if (body.imagesToDelete && body.imagesToDelete.length) {
        forEach(body.imagesToDelete, (path) => {
          if (fs.existsSync(`./uploads/${path}`))
            fs.unlinkSync(`./uploads/${path}`);
        })
      }
      const drugAdBody = clone(body);
      drugAdBody['drugAdImages'] = images.filter((img)=>{
        return !body.imagesToDelete.includes(img)
      })
      await this.model.updateOne({ _id: new ObjectIdType(id), pharmacyId: new ObjectIdType(pharmacyId) }, { "$set": drugAdBody })
      const pipelineConfig = aggregationPipelineConfig(lang)
      const pipeline = aggregationMan(pipelineConfig, { _id: new ObjectIdType(id) })
      return (await this.model.aggregate(pipeline))[0];
    } else {
      return new HttpException(
        'Drug ad is not found',
        HttpStatus.METHOD_NOT_ALLOWED,
      );
    }
  }
}