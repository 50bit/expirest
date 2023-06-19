import { loadPlugins } from '../utils/db.utils';
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

loadPlugins(GovernoratesSchema);
export { GovernoratesSchema };