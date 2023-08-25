import {
    ObjectId,
    loadPlugins,
    onUserSave,
    onUserUpdate,
  } from '../../../common/utils/db.utils';
  import * as mongoose from 'mongoose';
  
  const SysAdminchema = new mongoose.Schema(
    {

      email: {
        type: String,
        default: null
      },
      password: {
        type: String,
        select: false,
        default: null
      }
    },
    {
      timestamps: true
    },
  );
  
  loadPlugins(SysAdminchema);
  onUserSave(SysAdminchema);
  onUserUpdate(SysAdminchema);

  export { SysAdminchema };