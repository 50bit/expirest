import {
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
  },
  {
    timestamps: true,
  },
);

loadPlugins(UserSchema);
onUserSave(UserSchema);
onUserUpdate(UserSchema);
export { UserSchema };