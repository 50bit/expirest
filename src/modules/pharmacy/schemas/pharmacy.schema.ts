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
            autopopulate:true
        },
        cityId: {
            type: ObjectId,
            ref: 'cities',
            autopopulate:true
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
        toObject: {virtuals:true}
    },
);

loadPlugins(PharmacySchema);

export { PharmacySchema };