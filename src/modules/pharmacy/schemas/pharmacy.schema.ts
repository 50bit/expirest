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
        governorate_id: {
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
        pharmacistId: {
            type: String
        }
    },
    {
        timestamps: true,
        toObject: { virtuals: true }
    },
);
export const aggregationPipelineConfig  = (lang) => ([
    {
        "ref": "cities",
        "lookupField": "_id",
        "foriegnField": "cityId",
        "langConfig": {
            "langField": "city_name",
            "lang": lang
        },
        "innerLookup": {
            "ref": "governorates",
            "lookupField": "id",
            "foriegnField": "governorate_id",
            "langConfig": {
                "langField": "governorate_name",
                "lang": lang
            }
        }
    },
    {
        "ref": "governorates",
        "lookupField": "_id",
        "foriegnField": "governorate_id",
        "langConfig": {
            "langField": "governorate_name",
            "lang": lang
        }
    }
])
loadPlugins(PharmacySchema);
export { PharmacySchema };