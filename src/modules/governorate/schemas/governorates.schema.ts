import { loadPlugins } from '../../../common/utils/db.utils';
import { ObjectId } from 'mongodb';
import * as mongoose from 'mongoose';

const GovernoratesSchema: mongoose.Schema = new mongoose.Schema(
    {
        id: {
            type: String
        },
        governorate_name_ar: {
            type: String,
        },
        governorate_name_en: {
            type: String,
        }
    },
    {
        timestamps: true,
    },
);
export const aggregationPipelineConfig  = (lang) => ([
    {
        "langConfig": {
            "langField": "governorate_name",
            "lang": lang
        }
    }
])
loadPlugins(GovernoratesSchema);
export { GovernoratesSchema };