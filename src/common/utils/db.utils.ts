import * as mongoose from 'mongoose';
import mongooseAutopopulate from 'mongoose-autopopulate';
import * as bcrypt from 'bcryptjs';
import { Schema } from 'mongoose';


export const ObjectIdType = mongoose.Types.ObjectId;

export const ObjectId = mongoose.Schema.Types.ObjectId;

export const loadPlugins = (schema: any) => {
  schema.plugin(mongooseAutopopulate);
  return schema;
};

export const onUserUpdate = (schema: Schema) => {
  schema.pre<any>('updateOne', function (next) {
    if (this._update.$set && this._update.$set.password) {
      const hash = bcrypt.hashSync(this._update.$set.password.toString(), bcrypt.genSaltSync(8), null);
      this._update.$set.password = hash;
      next();
    } else if (this._update.password) {
      const hash = bcrypt.hashSync(this._update.password, bcrypt.genSaltSync(10), null);
      this._update.password = hash;
      next();
    } else {
      next();
    }
  });
  schema.methods.isPasswordMatch = bcrypt.compareSync;
};

export const onUserSave = (schema: Schema) => {
  schema.pre<any>('save', function (next) {
    if (this.password) {
      const hash = bcrypt.hashSync(this.password.toString(), bcrypt.genSaltSync(8), null);
      this.password = hash;
      next();
    }
  });
};