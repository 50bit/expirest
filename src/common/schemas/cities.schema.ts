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

loadPlugins(CitiesSchema);
export { CitiesSchema };