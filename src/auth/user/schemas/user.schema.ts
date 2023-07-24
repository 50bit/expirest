import {
  ObjectId,
  loadPlugins,
  onUserSave,
  onUserUpdate,
} from '../../../common/utils/db.utils';
import * as mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      default: null
    },
    email: {
      type: String,
      default: null
    },
    phoneNumber: {
      type: String,
      default: null
    },
    password: {
      type: String,
      select: false,
      default: null
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    activatedByEmail: {
      type: Boolean,
      default: false,
    },
    pharmacyId:{
      type: ObjectId,
      default: null
    },
    pharmacistId:{
      type: String,
      default: null
    },
    approved:{
      type: Boolean,
      default: false,
    },
    verficationCode:{
      type: Number,
      default: null
    },
    active:{
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true
  },
);

loadPlugins(UserSchema);
onUserSave(UserSchema);
onUserUpdate(UserSchema);
export const aggregationPipelineConfig = (lang) => ([
  {
      "ref": "pharmacies",
      "lookupField": "_id",
      "foriegnField": "pharmacyId",
      "exclude":["password"],
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
])
export { UserSchema };