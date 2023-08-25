import { loadPlugins } from '../../../common/utils/db.utils';
import { ObjectId } from 'mongodb';
import * as mongoose from 'mongoose';
const REMAINING_TIME = 48
const ordersSchema: mongoose.Schema = new mongoose.Schema(
    {
        pharmacyId: {
            type: ObjectId,
            required: true
        },
        drugRequests:[
            {
                type: ObjectId
            }
        ],
        status:{
            type: String,
            enum: ['pending', 'preparing', 'delivered'],
            default: 'pending'
        }
    },
    {
        timestamps: true,
    },
);
export const aggregationPipelineConfig = (lang) => ([
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
    },
    {
        "ref": "drug-requests",
        "lookupField": "_id",
        "foriegnField": "drugRequests",
        "unwind":{
            "field":"$drugRequests",
            "groupedFields":["pharmacyId","status"]
        },
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
    }
])
loadPlugins(ordersSchema);
export { ordersSchema };