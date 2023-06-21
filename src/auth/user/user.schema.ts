import {
  ObjectId,
  loadPlugins,
  onUserSave,
  onUserUpdate,
} from '../../common/utils/db.utils';
import * as mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
    },
    email: {
      type: String,
    },
    phoneNumber: {
      type: String,
    },
    password: {
      type: String,
      select: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    activatedByEmail: {
      type: Boolean,
      default: true,
    },
    pharmacyId:{
      type: ObjectId,
      ref: 'pharmacies',
      autopopulate:true
    }
  },
  {
    timestamps: true
  },
);

loadPlugins(UserSchema);
onUserSave(UserSchema);
onUserUpdate(UserSchema);


export { UserSchema };