import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CrudService } from 'src/common/crud/services/crud.service';
import { ObjectIdType } from 'src/common/utils/db.utils';
import { aggregationPipelineConfig } from '../schemas/drugRequest.schema';
import { aggregationMan } from 'src/common/utils/aggregationMan.utils';
import { clone } from 'lodash'
@Injectable()
export class DrugRequestService extends CrudService {
  constructor(
    @InjectModel('drug-requests') public readonly model: Model<any>,
    @InjectModel('drug-ads') public readonly drugAdsModel: Model<any>,
    @InjectModel('carts') public readonly cartModel: Model<any>,
  ) {
    super(model);
  }

  async createRequest(body, lang) {
    // TODO: disable requesting from your own pharmacy
    const { drugAdId } = body
    const drugAd = await this.drugAdsModel.findOne({ _id: new ObjectIdType(drugAdId) })
    if (drugAd) {
      const drugRequestBody = clone(body)
      delete drugAd._id
      drugRequestBody['drugAdId'] = drugAd
      drugRequestBody['status'] = 'pending'
      const drugRequest = await this.model.create(drugRequestBody)
      const pipelineConfig = aggregationPipelineConfig(lang)
      const pipeline = aggregationMan(pipelineConfig, { _id: new ObjectIdType(drugRequest._id) })
      return (await this.model.aggregate(pipeline))[0];
    } else {
      throw new HttpException(
        'Drug ad is not found',
        HttpStatus.METHOD_NOT_ALLOWED,
      );
    }
  }

  async updateDrugRequest(id, body, lang) {
    await this.model.updateOne({ "_id": new ObjectIdType(id) }, { "$set": body })
    const pipelineConfig = aggregationPipelineConfig(lang)
    const pipeline = aggregationMan(pipelineConfig, { "_id": new ObjectIdType(id) })
    const drugRequest = (await this.model.aggregate(pipeline))[0] || {};
    return drugRequest
  }

  async approve(id, lang) {
    const drugRequest = await this.model.findOne({"_id": new ObjectIdType(id)})
    const drugAd = await this.drugAdsModel.findOne({_id:new ObjectIdType(drugRequest.drugAdId)})
    if(drugAd.availablePackages >= drugRequest.packages && drugAd.availablePackageUnits >= drugRequest.packageUnits){
      await this.model.updateOne({ "_id": new ObjectIdType(id) }, { "$set": { "status": 'approved' } })
      const pipelineConfig = aggregationPipelineConfig(lang)
      const pipeline = aggregationMan(pipelineConfig, { "_id": new ObjectIdType(id) })
      const drugRequest = (await this.model.aggregate(pipeline))[0] || {};
      return drugRequest
    }else{
      throw new HttpException(
        `Packages should be less than or equal ${drugAd.availablePackages} and package units should be less than or equal ${drugAd.availablePackageUnits}`,
        HttpStatus.METHOD_NOT_ALLOWED,
      );
    }
  }

  async reject(id) {
    await this.model.updateOne({ "_id": new ObjectIdType(id) }, { "$set": { "status": 'rejected' } })
  }

  async deleteDrugRequest(id, lang) {
    try {
      await this.delete(id);
      await this.cartModel.deleteOne({ drugRequestId: id })
      throw new HttpException(
        'DrugRequest has been successfully deleted',
        HttpStatus.OK,
      );
    } catch (error) {
      console.log(error)
      throw new HttpException(
        'Something happened while deleting',
        HttpStatus.METHOD_NOT_ALLOWED,
      );
    }

  }

}