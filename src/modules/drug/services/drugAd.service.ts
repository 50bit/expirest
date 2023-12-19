import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CrudService } from 'src/common/crud/services/crud.service';
import { forEach, clone, cloneDeep, orderBy,map } from 'lodash'
import fs from 'fs';
import { ObjectIdType } from 'src/common/utils/db.utils';
import { aggregationPipelineConfig } from '../schemas/drugAd.schema';
import { aggregationMan } from 'src/common/utils/aggregationMan.utils';
import { DeliveryZonesService } from 'src/modules/delivery-zones/services/delivery-zones.service';
@Injectable()
export class DrugAdService extends CrudService {
  constructor(
    @InjectModel('drug-ads') public readonly model: Model<any>,
    @InjectModel('drug-requests') public readonly drugRequestModel: Model<any>,
    @InjectModel('pharmacies') public readonly pharmacyModel: Model<any>,
    @InjectModel('users') public readonly usersModel: Model<any>,
    private readonly deliveryZonesService:DeliveryZonesService
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
      throw new HttpException(
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
      throw new HttpException(
        'Drug ad is not found',
        HttpStatus.METHOD_NOT_ALLOWED,
      );
    }
  }

  async deactivate(id){
    const drugRequests = await this.drugRequestModel.find({drugAdId:new ObjectIdType(id)})
    if(drugRequests && drugRequests.length){
      for(const request of drugRequests){
        await this.drugRequestModel.updateOne({ "_id": request._id }, { "$set": { "status": 'rejected' } })
      }
    }
    if(!drugRequests || (drugRequests && drugRequests.length === 0)){
      return await this.deleteDrugAd(id)
    }
    return await this.model.updateOne({ "_id": id }, { "$set": { "deactivated": true } })
  }

  async addDeliveryZoneBoolean(pharmacyId,arr){
    const pharmacy = await this.pharmacyModel.findOne({_id:pharmacyId})
    const drugAds = cloneDeep(arr)
    if(pharmacy && pharmacy.cityId && pharmacy.cityId._id)
      for(const drugAd of drugAds){
    
        if(drugAd.pharmacyId && drugAd.pharmacyId.cityId && drugAd.pharmacyId.cityId._id){
          // console.log({cityId:pharmacy.cityId._id,deliveryZone:drugAd.pharmacyId.cityId._id || ""})
          drugAd['inDeliveryZone'] = await this.deliveryZonesService.inDeliveryZone({cityId:pharmacy.cityId._id,deliveryZones:drugAd.pharmacyId.cityId._id || ""})
        }
        if(drugAd.pharmacyId && drugAd.pharmacyId._id){
          const users = await this.usersModel.find({pharmacyId:drugAd.pharmacyId._id})
          drugAd['phoneNumbers'] = map(users,(user)=>user.phoneNumber)
        }
      }

    return drugAds;
  }
}