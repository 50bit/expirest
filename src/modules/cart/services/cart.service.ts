import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CrudService } from 'src/common/crud/services/crud.service';
import { aggregationPipelineConfig } from '../schemas/cart.schema';
import { aggregationMan } from 'src/common/utils/aggregationMan.utils';
import { ObjectIdType } from 'src/common/utils/db.utils';
import { forEach, get } from 'lodash'
import { aggregationPipelineConfig as pharmacyAggregationPipelineConfig } from '../../pharmacy/schemas/pharmacy.schema';
import { aggregationPipelineConfig as drugRequestAggregationPipelineConfig } from '../../drug/schemas/drugRequest.schema'

@Injectable()
export class CartService extends CrudService {
  constructor(
    @InjectModel('carts') public readonly model: Model<any>,
    @InjectModel('pharmacies') public readonly pharmacyModel: Model<any>,
    @InjectModel('drug-requests') public readonly drugRequestModel: Model<any>,
  ) {
    super(model);
  }

  async addItemToCart(body, lang) {
    const drugRequestPipelineConfig = drugRequestAggregationPipelineConfig(lang)
    const drugRequestPipeline = aggregationMan(drugRequestPipelineConfig, { "_id": new ObjectIdType(body.drugRequestId) })
    const drugRequest = (await this.drugRequestModel.aggregate(drugRequestPipeline))[0];
    // TODO: increase quantity if item already exists in the cart
    if (drugRequest && drugRequest.status === "approved") {
      const cartItem = await this.model.create(body)
      const pipelineConfig = aggregationPipelineConfig(lang)
      const pipeline = aggregationMan(pipelineConfig, { "_id": new ObjectIdType(cartItem._id) })
      return (await this.model.aggregate(pipeline))[0];
    } else {
      throw new HttpException(
        'Drug request is not approved yet',
        HttpStatus.METHOD_NOT_ALLOWED,
      );
    }
  }

  async checkout(pharmacyId, id, lang) {
    const pipelineConfig = aggregationPipelineConfig(lang)
    const pipeline = aggregationMan(pipelineConfig, { pharmacyId: new ObjectIdType(pharmacyId), userId: new ObjectIdType(id), checkedOut: false })
    const cartItems = await this.model.aggregate(pipeline);
    const errors = [];
    const pharmacyPipelineConfig = pharmacyAggregationPipelineConfig(lang);
    const pharmacyPipeline = aggregationMan(pharmacyPipelineConfig, { _id: new ObjectIdType(pharmacyId)})
    const pharmacy = (await this.pharmacyModel.aggregate(pharmacyPipeline))[0] ;
    let cartTotal = 0;
    if (cartItems && cartItems.length > 0) {
      for (const item of cartItems) {
        const pharmacyGovernorateId = pharmacy.governorateId.id
        const currentItemGovernorateId = get(item.pharmacyId, "governorateId.id", undefined)
        if (currentItemGovernorateId && (pharmacyGovernorateId == currentItemGovernorateId)) {
          const drugRequest = item.drugRequestId 

          const drugAd = drugRequest.drugAdId 
          const requestPackages = drugRequest.packages;
          const requestPackageUnits = drugRequest.packageUnits;

          const drugAdPackages = drugAd.availablePackages;
          const drugAdPackageUnits = drugAd.availablePackageUnits

          if (drugAdPackages >= requestPackages && drugAdPackageUnits >= requestPackageUnits) {
            cartTotal += drugRequest.total

          } else {
            errors.push(`Packages should be less than or equal ${drugAd.availablePackages} and package units should be less than or equal ${drugAd.availablePackageUnits} in your order from ${pharmacy.name} pharmacy, please update the item from this pharmacy in order to procceed. `)
          }

        } else {
          errors.push(`${pharmacy.name} pharmacy is in a different governorate ${currentItemGovernorateId}, please remove the item from this pharmacy in order to procceed. `)
        }
      }
      if (cartTotal > 0 && errors.length === 0) {
        for (const item of cartItems) {
          await this.model.updateOne({ _id: item._id }, { "$set": { "checkedOut": true } })
        }
        throw new HttpException(
          'All transaction has been correctly procceeded, Thank you for using Expirest ',
          HttpStatus.OK,
        );
      } else {
        throw new HttpException(
          {message:errors},
          HttpStatus.METHOD_NOT_ALLOWED,
        );
      }
    } else {
      throw new HttpException(
        'Cart is Empty',
        HttpStatus.OK,
      );
    }
  }
}