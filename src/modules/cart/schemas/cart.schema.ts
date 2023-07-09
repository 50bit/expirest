import { loadPlugins } from '../../../common/utils/db.utils';
import { ObjectId } from 'mongodb';
import * as mongoose from 'mongoose';
const REMAINING_TIME = 48
const CartsSchema: mongoose.Schema = new mongoose.Schema(
    {
        drugId: {
            type: ObjectId,
            required: true
        },
        userId: {
            type: ObjectId,
            required: true
        },
        confirmed:{
            type: Boolean,
            default: false
        },
        editable:{
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true,
    },
);
export const aggregationPipelineConfig  = (lang) => ([
    {
        "ref": "users",
        "lookupField": "_id",
        "foriegnField": "userId",
        "exclude":["password"],
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
        "ref": "drug-ads",
        "lookupField": "_id",
        "foriegnField": "drugId",
        "langConfig": {
            "langField": "drug_name",
            "lang": lang
        },
        "computedDateField":{
            "name": "remaining_time",
            "relatedField": "createdAt",
            "maxDuration": REMAINING_TIME
        }
    }
])
loadPlugins(CartsSchema);
export { CartsSchema };