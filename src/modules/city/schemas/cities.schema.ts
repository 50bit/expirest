import { loadPlugins } from '../../../common/utils/db.utils';
import { ObjectId } from 'mongodb';
import * as mongoose from 'mongoose';

const CitiesSchema: mongoose.Schema = new mongoose.Schema(
    {
        id: {
            type: String
        },
        governorateId: {
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
        "foriegnField": "governorateId",
        "langConfig": {
            "langField": "governorate_name",
            "lang": lang
        }
    }
])
loadPlugins(CitiesSchema);
export { CitiesSchema };