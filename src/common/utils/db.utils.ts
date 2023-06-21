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
  schema.pre<any>('updateOne', function(next) {
    if (this._update.$set && this._update.$set.password) {
      bcrypt.genSalt(10, (err, salt) => {
        if (err) {
          return next(err);
        }
        bcrypt.hash(this._update.$set.password, salt, (err2, hash: any) => {
          if (err2) {
            return next(err2);
          }
          this._update.$set.password = hash;
          next();
        });
      });
    } else if (this._update.password) {
      bcrypt.genSalt(10, (err, salt) => {
        if (err) {
          return next(err);
        }
        bcrypt.hash(this._update.password, salt, (err2, hash: any) => {
          if (err2) {
            return next(err2);
          }
          this._update.password = hash;
          next();
        });
      });
    } else {
      next();
    }
  });
  schema.methods.isPasswordMatch = bcrypt.compareSync;
};

export const onUserSave = (schema: Schema) => {
  schema.pre<any>('save', function(next) {
    bcrypt.genSalt(10, (err, salt) => {
      if (err) {
        return next(err);
      }
      bcrypt.hash(this.password, salt, (err2, hash: any) => {
        if (err2) {
          return next(err2);
        }
        this.password = hash;
        next();
      });
    });
  });

  schema.pre<any>('updateOne', function(next) {
    if (this._update.$set && this._update.$set.password) {
      bcrypt.genSalt(10, (err, salt) => {
        if (err) {
          return next(err);
        }
        bcrypt.hash(this._update.$set.password, salt, (err2, hash: any) => {
          if (err2) {
            return next(err2);
          }
          this._update.$set.password = hash;
          next();
        });
      });
    } else if (this._update.password) {
      bcrypt.genSalt(10, (err, salt) => {
        if (err) {
          return next(err);
        }
        bcrypt.hash(this._update.password, salt, (err2, hash: any) => {
          if (err2) {
            return next(err2);
          }
          this._update.password = hash;
          next();
        });
      });
    } else {
      next();
    }
  });
  schema.methods.isPasswordMatch = bcrypt.compareSync;
};