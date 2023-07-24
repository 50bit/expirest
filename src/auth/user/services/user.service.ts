import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { AuthService } from '../../services/auth.service';
import { CrudService } from 'src/common/crud/services/crud.service';
import { MailUtils } from 'src/common/utils/mail.utils';
import { random, clone } from 'lodash';
import { aggregationPipelineConfig } from '../schemas/user.schema';
import { aggregationMan } from 'src/common/utils/aggregationMan.utils';
import { ObjectIdType } from 'src/common/utils/db.utils';

@Injectable()
export class UserService extends CrudService {
  constructor(
    private readonly authService: AuthService,
    @InjectModel('users') public readonly userModel: Model<any>,
    @InjectModel('pharmacies') public readonly pharmacyModel: Model<any>,
    private readonly mailUtils: MailUtils
  ) {
    super(userModel);
  }

  async addUser(body) {
    const userExists = await this.userModel.findOne({
      email: body.email
    });
    if (userExists)
      throw new HttpException(
        'User already exists, please contact the administration',
        HttpStatus.METHOD_NOT_ALLOWED,
      );

    const verficationCode = random(10000, 99999)
    try {
      body["verficationCode"] = verficationCode;
      const user = await this.userModel.create({...body});
      await this.mailUtils.sendVerificationEmail('', verficationCode, body.email, false)
      return user
    } catch (error) {
      throw new HttpException(
        'Email is not valid or can\'t be reached',
        HttpStatus.METHOD_NOT_ALLOWED,
      );
    }
  }

  async sendChangePassCode(body) {
    const verficationCode = random(10000, 99999)
    try {
      await this.userModel.updateOne({ email: body.email }, { "$set": { verficationCode } })
      await this.mailUtils.sendVerificationEmail('', verficationCode, body.email, true)
      return await this.userModel.findOne({ email: body.email })
    } catch (error) {
      throw new HttpException(
        'Email is not valid or can\'t be reached',
        HttpStatus.METHOD_NOT_ALLOWED,
      );
    }
  }

  async changePassword(body, _id) {
    const user = await this.userModel
      .findOne({
        _id,
      })

    if (user) {
      await this.userModel.updateOne(
        { _id },
        {
          "$set": { password: body.password },
        },
      );
    } else {
      throw new HttpException(
        'User Not Found Or Has No Access',
        HttpStatus.METHOD_NOT_ALLOWED,
      );
    }
  }

  async updateUser(_id,body,lang) {
    const user = await this.userModel
      .findOne({
        _id,
      })
    if (user) {
      const updatedUser = await this.userModel.updateOne(
        { _id },
        {
          "$set": body,
        },
      );
      const pipelineConfig = aggregationPipelineConfig(lang)
      const pipeline = aggregationMan(pipelineConfig, { _id: new ObjectIdType(_id) })
      return (await this.userModel.aggregate(pipeline))[0];
    } else {
      throw new HttpException(
        'User Not Found Or Has No Access',
        HttpStatus.METHOD_NOT_ALLOWED,
      );
    }
  }
}