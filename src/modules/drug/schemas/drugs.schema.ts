import { loadPlugins } from '../../../common/utils/db.utils';
import { ObjectId } from 'mongodb';
import * as mongoose from 'mongoose';
const DrugsSchema: mongoose.Schema = new mongoose.Schema(
    {
        drug_name_en: {
            type: String
        },
        drug_name_ar: {
            type: String
        },
        price: {
            type: Number
        },
        activeSubstance: {
            type: String
        },
        category: {
            type: String
        },
        barcode: {
            type: String
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
    }
])
loadPlugins(DrugsSchema);
DrugsSchema.index({"drug_name_en":"text","drug_name_ar":"text"})
export { DrugsSchema };