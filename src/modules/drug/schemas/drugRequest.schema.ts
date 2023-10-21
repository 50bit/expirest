import { loadPlugins } from '../../../common/utils/db.utils';
import { ObjectId } from 'mongodb';
import * as mongoose from 'mongoose';
const DrugRequestSchema: mongoose.Schema = new mongoose.Schema(
    {
        drugAdId: {
            type: ObjectId,
            required: true
        },
        packages: {
            type: Number,
            required: true
        },
        packageUnits: {
            type: Number,
            required: true
        },
        discount: {
            type: Number,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        total: {
            type: Number
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
        "ref": "drug-ads",
        "lookupField": "_id",
        "foriegnField": "drugAdId",
        "langConfig": {
            "langField": "drug_name",
            "lang": lang
        },
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
            }
        ]
    }
])
loadPlugins(DrugRequestSchema);
export { DrugRequestSchema };