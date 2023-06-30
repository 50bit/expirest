import { loadPlugins } from '../../../common/utils/db.utils';
import { ObjectId } from 'mongodb';
import * as mongoose from 'mongoose';
const DrugAdSchema: mongoose.Schema = new mongoose.Schema(
    {
        drug_name_en: {
            type: String,
            required: true
        },
        drug_name_ar: {
            type: String,
            required: true
        },
        packageUnits: {
            type: Number,
            required: true
        },
        expiryDate: {
            type: Number,
            required: true
        },
        availablePackages: {
            type: Number,
            required: true
        },
        availablePackageUnits: {
            type: Number,
            required: true
        },
        priceOnPackage: {
            type: Number,
            required: true
        },
        discount: {
            type: Number,
            required: true
        },
        sellingPrice: {
            type: Number,
            required: true
        },
        notes: {
            type: String
        },
        images: {
            type: [String]
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending'
        },
        pharmacyId: {
            type: ObjectId,
            required: true
        }
    },
    {
        timestamps: true,
    },
);
export const aggregationPipelineConfig = (lang) => ([
    {
        "langConfig": {
            "langField": "drug_name",
            "lang": lang
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
loadPlugins(DrugAdSchema);
export { DrugAdSchema };