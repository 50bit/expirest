import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CrudService } from 'src/common/crud/services/crud.service';
import { ObjectIdType } from 'src/common/utils/db.utils';
import { aggregationPipelineConfig } from '../schemas/drugRequest.schema';
import { aggregationMan } from 'src/common/utils/aggregationMan.utils';
import { aggregationPipelineConfig as cartAggregationPipelineConfig } from '../../cart/schemas/cart.schema';
import { clone, findIndex, get } from 'lodash';

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
    const isOurDrugAd = await this.drugAdsModel.findOne({ _id: new ObjectIdType(drugAdId), pharmacyId: new ObjectIdType(body.pharmacyId) })
    // if (isOurDrugAd) {
    //   throw new HttpException(
    //     'You can\'t request from your own pharmacy',
    //     HttpStatus.METHOD_NOT_ALLOWED,
    //   );
    // }

    const cartPipelineConfig = cartAggregationPipelineConfig(lang)
    const cartPipeline = aggregationMan(cartPipelineConfig, { userId: new ObjectIdType(userId), pharmacyId: new ObjectIdType(body.pharmacyId), checkedOut: false })

    const drugAdLookupIndex = findIndex((cartPipeline), (lookup) => {
      return lookup.$lookup && lookup.$lookup.from === 'drug-requests'
    })

    if (drugAdLookupIndex >= 0) {
      const pipelineCopy = clone(cartPipeline)
      if (get(pipelineCopy[drugAdLookupIndex], '$lookup.pipeline[1].$lookup.pipeline[0].$match.$expr.$and')) {
        pipelineCopy[drugAdLookupIndex].$lookup.pipeline[1].$lookup.pipeline[0].$match.$expr.$and.push({ _id: new ObjectIdType(drugAdId) })
        const cartSameDrugRequests = await this.cartModel.aggregate(pipelineCopy);
        if (cartSameDrugRequests && cartSameDrugRequests.length > 0) {
          throw new HttpException(
            'You can\'t request the same drug twice, please check out the drug first from the cart',
            HttpStatus.METHOD_NOT_ALLOWED,
          );
        }
      }
    }

    const drugAd = await this.drugAdsModel.findOne({ _id: new ObjectIdType(drugAdId) })
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
    const isOurDrugAd = await this.drugAdsModel.findOne({ _id: new ObjectIdType(drugAdId), pharmacyId: new ObjectIdType(body.pharmacyId) })
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
      if (get(pipelineCopy[drugAdLookupIndex], '$lookup.pipeline[1].$lookup.pipeline[0].$match.$expr.$and')) {
        pipelineCopy[drugAdLookupIndex].$lookup.pipeline[1].$lookup.pipeline[0].$match.$expr.$and.push({ _id: new ObjectIdType(drugAdId) })
        const cartSameDrugRequests = await this.cartModel.aggregate(pipelineCopy);
        if (cartSameDrugRequests && cartSameDrugRequests.length > 0) {
          throw new HttpException(
            'You can\'t request the same drug twice, please check out the drug first from the cart',
            HttpStatus.METHOD_NOT_ALLOWED,
          );
        }
      }
    }

    const drugAd = await this.drugAdsModel.findOne({ _id: new ObjectIdType(drugAdId) })
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
    const drugAd = await this.drugAdsModel.findOne({ _id: new ObjectIdType(drugRequest.drugAdId) })
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