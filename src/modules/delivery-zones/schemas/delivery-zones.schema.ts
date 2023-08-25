import { loadPlugins } from '../../../common/utils/db.utils';
import { ObjectId } from 'mongodb';
import * as mongoose from 'mongoose';

const DeliveryZonesSchema: mongoose.Schema = new mongoose.Schema(
    {
        cityId: {
            type: ObjectId,
            required: true
        },
        deliveryZones:[
            {
                type: ObjectId
            }
        ]
    },
    {
        timestamps: true,
    },
);
export const aggregationPipelineConfig = (lang) => ([
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
    },
    {
        "ref": "cities",
        "lookupField": "_id",
        "foriegnField": "deliveryZones",
        "unwind":{
            "field":"$deliveryZones",
            "groupedFields":["cityId"]
        },
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
])
loadPlugins(DeliveryZonesSchema);
export { DeliveryZonesSchema };