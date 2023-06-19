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
            type: String
        },
        cityId: {
            type: String
        },
        address: {
            type: String
        },
        files: {
            type: Array
        }
    },
    {
        timestamps: true,
    },
);

loadPlugins(PharmacySchema);
export { PharmacySchema };