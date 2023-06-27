import { loadPlugins } from '../utils/db.utils';
import { ObjectId } from 'mongodb';
import * as mongoose from 'mongoose';

const CitiesSchema: mongoose.Schema = new mongoose.Schema(
    {
        id: {
            type: String
        },
        governorate_id: {
            type: String
        },
        city_name_ar: {
            type: String
        },
        city_name_en: {
            type: String
        },
    },
    {
        timestamps: true,
    },
);
export const aggregationPipelineConfig = (lang) => ([
    {
        "langConfig": {
            "langField": "city_name",
            "lang": lang
        }
    },
    {
        "ref": "governorates",
        "lookupField": "id",
        "foriegnField": "governorate_id",
        "langConfig": {
            "langField": "governorate_name",
            "lang": lang
        }
    }
])
loadPlugins(CitiesSchema);
export { CitiesSchema };