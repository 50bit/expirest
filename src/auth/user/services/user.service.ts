import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { AuthService } from '../../services/auth.service';
import { CrudService } from 'src/common/crud/services/crud.service';
import { MailUtils } from 'src/common/utils/mail.utils';
import { random } from 'lodash';
import { aggregationPipelineConfig } from '../schemas/user.schema';
import { aggregationMan } from 'src/common/utils/aggregationMan.utils';
import { ObjectIdType } from 'src/common/utils/db.utils';

@Injectable()
export class UserService extends CrudService {
  constructor(
    private readonly authService: AuthService,
    @InjectModel('users') public readonly model: Model<any>,
    @InjectModel('pharmacies') public readonly pharmacyModel: Model<any>,
    private readonly mailUtils: MailUtils
  ) {
    super(model);
  }

  async addUser(body) {
    const userExists = await this.model.findOne({
      email: body.email
    });

    if (userExists)
      return new HttpException(
        'User already exists, please contact the administration',
        HttpStatus.METHOD_NOT_ALLOWED,
      );

    const verficationCode = random(10000, 99999)
    try {
      await this.model.create(body);
      await this.mailUtils.sendVerificationEmail('', verficationCode, body.email)
    } catch (error) {
      console.log(error)
      return new HttpException(
        'Email is not valid or can\'t be reached',
        HttpStatus.METHOD_NOT_ALLOWED,
      );
    }
  }

  async sendChangePassCode(body) {
    const verficationCode = random(10000, 99999)
    try {
      await this.model.updateOne({ _id: body.email }, { "$set": { verficationCode } })
      await this.mailUtils.sendVerificationEmail('', verficationCode, body.email, true)
    } catch (error) {
      console.log(error)
      return new HttpException(
        'Email is not valid or can\'t be reached',
        HttpStatus.METHOD_NOT_ALLOWED,
      );
    }
  }

  async changePassword(body,_id) {
    const user = await this.model
      .findOne({
        _id,
      })

    if (user) {
      await this.model.updateOne(
        { _id },
        {
          "$set":{password: body.password},
        },
      );
    } else {
      throw new HttpException(
        'User Not Found Or Has No Access',
        HttpStatus.METHOD_NOT_ALLOWED,
      );
    }
  }
}