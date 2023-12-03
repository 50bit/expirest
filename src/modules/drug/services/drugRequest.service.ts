import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CrudService } from 'src/common/crud/services/crud.service';
import { ObjectIdType } from 'src/common/utils/db.utils';
import { aggregationPipelineConfig } from '../schemas/drugRequest.schema';
import { aggregationMan } from 'src/common/utils/aggregationMan.utils';
import { aggregationPipelineConfig as cartAggregationPipelineConfig } from '../../cart/schemas/cart.schema';
import { clone, findIndex, get, isEmpty } from 'lodash';

@Injectable()
export class DrugRequestService extends CrudService {
  constructor(
    @InjectModel('drug-requests') public readonly model: Model<any>,
    @InjectModel('drug-ads') public readonly drugAdsModel: Model<any>,
    @InjectModel('carts') public readonly cartModel: Model<any>,
  ) {
    super(model);
  }

  async createRequest(body, lang, userId) {
    // TESTIT: disable requesting from your own pharmacy
    const { drugAdId } = body
    const isOurDrugAd = await this.drugAdsModel.findOne({ _id: new ObjectIdType(drugAdId), pharmacyId: new ObjectIdType(body.pharmacyId),deactivated:false })
    if (isOurDrugAd) {
      throw new HttpException(
        'You can\'t request from your own pharmacy',
        HttpStatus.METHOD_NOT_ALLOWED,
      );
    }

    const drugRequestExists = await this.model.findOne({ drugAdId: new ObjectIdType(drugAdId), pharmacyId: new ObjectIdType(body.pharmacyId),status:{"$ne":"rejected" }})
    if (drugRequestExists) {
      throw new HttpException(
        'You can\'t request the same drug twice',
        HttpStatus.METHOD_NOT_ALLOWED,
      );
    }

    const cartPipelineConfig = cartAggregationPipelineConfig(lang)
    const cartPipeline = aggregationMan(cartPipelineConfig, { userId: new ObjectIdType(userId), pharmacyId: new ObjectIdType(body.pharmacyId), checkedOut: false })

    const drugAdLookupIndex = findIndex((cartPipeline), (lookup) => {
      return lookup.$lookup && lookup.$lookup.from === 'drug-requests'
    })

    if (drugAdLookupIndex >= 0) {
      const pipelineCopy = clone(cartPipeline)
      if (pipelineCopy) {
        pipelineCopy.push({
          "$match": {
            "drugRequestId.drugAdId._id": new ObjectIdType(drugAdId),
            "$expr": {
              "$and": [
                {
                  "$ne":["$drugRequestId.status","rejected"]
                }
              ]
            }
          }
        })
        const cartSameDrugRequests = await this.cartModel.aggregate(pipelineCopy);
        if (cartSameDrugRequests && cartSameDrugRequests.length > 0) {
          throw new HttpException(
            'You can\'t request the same drug twice, please check out the drug first from the cart',
            HttpStatus.METHOD_NOT_ALLOWED,
          );
        }
      }
    }

    const drugAd = await this.drugAdsModel.findOne({ _id: new ObjectIdType(drugAdId),deactivated:false })
    if (drugAd) {
      const drugRequestBody = clone(body)
      delete drugAd._id
      drugRequestBody['drugAdId'] = drugAd
      drugRequestBody['status'] = 'pending'
      if (!drugRequestBody.packageUnits && isNaN(parseInt(drugRequestBody.packageUnits)))
        drugRequestBody['packageUnits'] = null
      if (!drugRequestBody.packages && isNaN(parseInt(drugRequestBody.packages)))
        drugRequestBody['packages'] = null
      const drugRequest = await this.model.create(drugRequestBody)
      const pipelineConfig = aggregationPipelineConfig(lang)
      const pipeline = aggregationMan(pipelineConfig, { _id: new ObjectIdType(drugRequest._id) })
      const fullDrugRequest = (await this.model.aggregate(pipeline))[0];
      fullDrugRequest['isItemInCart'] = this.isItemInCart(fullDrugRequest._id, userId)
      return fullDrugRequest
    } else {
      throw new HttpException(
        'Drug ad is not found',
        HttpStatus.METHOD_NOT_ALLOWED,
      );
    }
  }

  async createAndAddToCart(body, lang, userId) {
    // TESTIT: disable requesting from your own pharmacy
    const { drugAdId } = body
    const isOurDrugAd = await this.drugAdsModel.findOne({ _id: new ObjectIdType(drugAdId), pharmacyId: new ObjectIdType(body.pharmacyId),deactivated:false })
    if (isOurDrugAd) {
      throw new HttpException(
        'You can\'t request from your own pharmacy',
        HttpStatus.METHOD_NOT_ALLOWED,
      );
    }
    const cartPipelineConfig = cartAggregationPipelineConfig(lang)
    const cartPipeline = aggregationMan(cartPipelineConfig, { userId: new ObjectIdType(userId), pharmacyId: new ObjectIdType(body.pharmacyId), checkedOut: false })

    const drugAdLookupIndex = findIndex((cartPipeline), (lookup) => {
      return lookup.$lookup && lookup.$lookup.from === 'drug-requests'
    })
    if (drugAdLookupIndex >= 0) {
      const pipelineCopy = clone(cartPipeline)
      if (pipelineCopy) {
        pipelineCopy.push({
          "$match": {
            "drugRequestId.drugAdId._id": new ObjectIdType(drugAdId),
            "$expr": {
              "$and": [
                {
                  "$ne":["$drugRequestId.status","rejected"]
                }
              ]
            }
          }
        })
        const cartSameDrugRequests = await this.cartModel.aggregate(pipelineCopy);
        if (cartSameDrugRequests && cartSameDrugRequests.length > 0) {
          throw new HttpException(
            'You can\'t request the same drug twice, please check out the drug first from the cart',
            HttpStatus.METHOD_NOT_ALLOWED,
          );
        }
      }
    }

    const drugAd = await this.drugAdsModel.findOne({ _id: new ObjectIdType(drugAdId),deactivated:false })
    if (body.discount !== drugAd.discount) {
      throw new HttpException(
        'Can\'t add drug to cart, the price you offer is different from the ad',
        HttpStatus.METHOD_NOT_ALLOWED,
      );
    }
    if (drugAd) {
      const drugRequestBody = clone(body)
      delete drugAd._id
      drugRequestBody['drugAdId'] = drugAd
      drugRequestBody['status'] = 'approved'
      if (!drugRequestBody.packageUnits && isNaN(parseInt(drugRequestBody.packageUnits)))
        drugRequestBody['packageUnits'] = null
      if (!drugRequestBody.packages && isNaN(parseInt(drugRequestBody.packages)))
        drugRequestBody['packages'] = null
      const drugRequest = await this.model.create(drugRequestBody)
      const pipelineConfig = aggregationPipelineConfig(lang)
      const pipeline = aggregationMan(pipelineConfig, { _id: new ObjectIdType(drugRequest._id) })
      const fullDrugRequest = (await this.model.aggregate(pipeline))[0];
      fullDrugRequest['isItemInCart'] = this.isItemInCart(fullDrugRequest._id, userId)

      const cartBody = {
        drugRequestId: fullDrugRequest._id,
        userId: new ObjectIdType(userId),
        pharmacyId: body.pharmacyId,
        checkedOut: false
      }

      if (!drugRequestBody.packageUnits && isNaN(parseInt(drugRequestBody.packageUnits)))
        cartBody['packageUnits'] = 0
      else cartBody['packageUnits'] = drugRequestBody.packageUnits

      if (!drugRequestBody.packages && isNaN(parseInt(drugRequestBody.packages)))
        cartBody['packages'] = 0
      else cartBody['packages'] = drugRequestBody.packages

      
      await this.cartModel.create(cartBody)
      return fullDrugRequest

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
    const drugRequest = await this.model.findOne({ "_id": new ObjectIdType(id) })
    const drugAd = await this.drugAdsModel.findOne({ _id: new ObjectIdType(drugRequest.drugAdId),deactivated:false })
    if (drugAd.availablePackages >= drugRequest.packages && drugAd.availablePackageUnits >= drugRequest.packageUnits) {
      await this.model.updateOne({ "_id": new ObjectIdType(id) }, { "$set": { "status": 'approved' } })
      const pipelineConfig = aggregationPipelineConfig(lang)
      const pipeline = aggregationMan(pipelineConfig, { "_id": new ObjectIdType(id) })
      const drugRequest = (await this.model.aggregate(pipeline))[0] || {};
      return drugRequest
    } else {
      throw new HttpException(
        `Packages should be less than or equal ${drugAd.availablePackages} and package units should be less than or equal ${drugAd.availablePackageUnits}`,
        HttpStatus.METHOD_NOT_ALLOWED,
      );
    }
  }

  async reject(id) {
    const inCart = this.cartModel.findOne({ drugRequestId: id })
    if(isEmpty(inCart) || !inCart){
      await this.model.updateOne({ "_id": new ObjectIdType(id) }, { "$set": { "status": 'rejected' } })
      throw new HttpException(
        'DrugRequest has been successfully updated',
        HttpStatus.OK,
      );
    }else{
      const isCheckedOut = this.cartModel.findOne({ drugRequestId: id,checkedOut:false })
      if(isEmpty(isCheckedOut) || !isCheckedOut){
        await this.model.updateOne({ "_id": new ObjectIdType(id) }, { "$set": { "status": 'rejected' } })
        await this.cartModel.deleteOne({ drugRequestId: id })
        throw new HttpException(
          'DrugRequest has been successfully updated and request has been deleted from the cart',
          HttpStatus.OK,
        );
      }else{
        throw new HttpException(
          'Can\'t reject a checked out request',
          HttpStatus.METHOD_NOT_ALLOWED,
        );
      }
    }
  }

  async deleteDrugRequest(id, lang) {
    try {
      const isCheckedOut = await this.cartModel.findOne({ drugRequestId: id,checkedOut:false })
      if(!isCheckedOut){
        await this.delete(id);
        await this.cartModel.deleteOne({ drugRequestId: id })
        throw new HttpException(
          'DrugRequest has been successfully deleted',
          HttpStatus.OK,
        );
      }else{
        throw new HttpException(
          'Can\'t delete a checked out request',
          HttpStatus.METHOD_NOT_ALLOWED,
        );
      }
      
    } catch (error) {
      throw new HttpException(
        'Something happened while deleting',
        HttpStatus.METHOD_NOT_ALLOWED,
      );
    }

  }

  async isItemInCart(id, userId) {
    const isItemInCart = await this.cartModel.findOne({ drugRequestId: id, checkedOut: false, userId })
    return isItemInCart ? true : false
  }

}