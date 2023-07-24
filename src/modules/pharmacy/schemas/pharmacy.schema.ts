import { loadPlugins } from '../../../common/utils/db.utils';
import { ObjectId } from 'mongodb';
import * as mongoose from 'mongoose';

const PharmacySchema: mongoose.Schema = new mongoose.Schema(
    {
        name: {
            type: String
        },
        phoneNumber: {
            type: String,
            match: /^01[0125][0-9]{8}$/gm
        },
        governorateId: {
            type: ObjectId,
            ref: 'governorates',
            autopopulate: true
        },
        cityId: {
            type: ObjectId,
            ref: 'cities',
            autopopulate: true
        },
        address: {
            type: String
        },
        pharmacyLiscence: {
            type: String
        },
        active:{
          type: Boolean,
          default: true,
        },
    },
    {
        timestamps: true,
        toObject: { virtuals: true }
    },
);
export const aggregationPipelineConfig = (lang) => ([
    {
        "ref": "cities",
        "lookupField": "_id",
        "foriegnField": "cityId",
        "langConfig": {
            "langField": "city_name",
            "lang": lang
        },
        "innerLookup": [
            {
                "ref": "governorates",
                "lookupField": "id",
                "foriegnField": "governorateId",
                "langConfig": {
                    "langField": "governorate_name",
                    "lang": lang
                }
            }
        ]
    },
    {
        "ref": "governorates",
        "lookupField": "_id",
        "foriegnField": "governorateId",
        "langConfig": {
            "langField": "governorate_name",
            "lang": lang
        }
    }
])
loadPlugins(PharmacySchema);
export { PharmacySchema };