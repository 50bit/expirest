import { loadPlugins } from '../../../common/utils/db.utils';
import { ObjectId } from 'mongodb';
import * as mongoose from 'mongoose';
const REMAINING_TIME = 48
const CartsSchema: mongoose.Schema = new mongoose.Schema(
    {
        drugRequestId: {
            type: ObjectId,
            required: true
        },
        userId: {
            type: ObjectId,
            required: true
        },
        pharmacyId: {
            type: ObjectId,
            required: true
        },
        checkedOut: {
            type: Boolean,
            default: false
        },
        orderId:{
            type: Number
        }
    },
    {
        timestamps: true,
    },
);
export const aggregationPipelineConfig = (lang) => ([
    {
        "ref": "users",
        "lookupField": "_id",
        "foriegnField": "userId",
        "exclude": ["password"],
        "innerLookup": [
            {
                "ref": "pharmacies",
                "lookupField": "_id",
                "foriegnField": "pharmacyId",
                "innerLookup": [
                    {
                        "ref": "governorates",
                        "lookupField": "_id",
                        "foriegnField": "governorateId",
                        "langConfig": {
                            "langField": "governorate_name",
                            "lang": lang
                        }
                    },
                    {
                        "ref": "cities",
                        "lookupField": "_id",
                        "foriegnField": "cityId",
                        "langConfig": {
                            "langField": "city_name",
                            "lang": lang
                        }
                    }
                ]
            }
        ]
    },
    {
        "ref": "drug-requests",
        "lookupField": "_id",
        "foriegnField": "drugRequestId",
        "innerLookup": [
            {
                "ref": "drug-ads",
                "lookupField": "_id",
                "foriegnField": "drugAdId",
                "langConfig": {
                    "langField": "drug_name",
                    "lang": lang
                },
                "innerLookup":[
                   {
                        "ref": "pharmacies",
                        "lookupField": "_id",
                        "foriegnField": "pharmacyId",
                        "innerLookup": [
                            {
                                "ref": "governorates",
                                "lookupField": "_id",
                                "foriegnField": "governorateId",
                                "langConfig": {
                                    "langField": "governorate_name",
                                    "lang": lang
                                }
                            },
                            {
                                "ref": "cities",
                                "lookupField": "_id",
                                "foriegnField": "cityId",
                                "langConfig": {
                                    "langField": "city_name",
                                    "lang": lang
                                }
                            }
                        ]
                    }
                ]
            }
        ],
        "computedDateField": {
            "name": "remaining_time",
            "relatedField": "createdAt",
            "maxDuration": REMAINING_TIME
        }
    },
    {
        "ref": "pharmacies",
        "lookupField": "_id",
        "foriegnField": "pharmacyId",
        "innerLookup": [
            {
                "ref": "governorates",
                "lookupField": "_id",
                "foriegnField": "governorateId",
                "langConfig": {
                    "langField": "governorate_name",
                    "lang": lang
                }
            },
            {
                "ref": "cities",
                "lookupField": "_id",
                "foriegnField": "cityId",
                "langConfig": {
                    "langField": "city_name",
                    "lang": lang
                }
            }
        ]
    }
])
loadPlugins(CartsSchema);
export { CartsSchema };