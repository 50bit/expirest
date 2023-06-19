import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { AuthService } from '../services/auth.service';
import { CrudService } from 'src/common/crud/services/crud.service';

@Injectable()
export class UserService extends CrudService {
  constructor(
    private readonly authService: AuthService,
    @InjectModel('users') public readonly model: Model<any>,
  ) {
    super(model);
    this.model.findOne({ isSysAdmin: true }).then(user => {
      if (!user) {
        const userObject = {
          email: 'SysAdmin@mail.com',
          phoneNumber: '010000000000',
          fullName: 'SysAdmin',
          password: 'SallyPharmacy@SysAdmin',
          isSysAdmin: true,
          address: '',
        };
        this.model.create(userObject);
      }
    });
  }

  async changePassword(userObject: any, body: any) {
    const user = await this.model
      .findOne({
        _id: userObject.id,
      })
      .select('fullname email username password isSysAdmin');

    if (user) {
      const isMatch = await user.isPasswordMatch(
        body.oldPassword,
        user.password,
      );
      if (isMatch) {
        await this.model.updateOne(
          { _id: userObject.id },
          {
            password: body.newPassword,
          },
        );
        return {
          email: user.email,
          phoneNumber: user.phoneNumber,
          fullName: user.fullName,
        };
      } else {
        throw new HttpException(
          'User Not Found',
          HttpStatus.METHOD_NOT_ALLOWED,
        );
      }
    } else {
      throw new HttpException(
        'User Not Found Or Has No Access',
        HttpStatus.METHOD_NOT_ALLOWED,
      );
    }
  }

  async login(body: any) {
    const user = await this.model
      .findOne({
        phoneNumber: body.phoneNumber,
      })
      .select('fullname email username password isSysAdmin');
    if (!user) {
      throw new HttpException(
        'User Not Found Or Has No Access',
        HttpStatus.METHOD_NOT_ALLOWED,
      );
    } else {
      const isMatch = await user.isPasswordMatch(body.password, user.password);
      // Invalid password
      if (!isMatch) {
        throw new HttpException(
          'User Not Found',
          HttpStatus.METHOD_NOT_ALLOWED,
        );
      } else {
        return await {
          fullName: user.fullName,
          token: await this.authService.generateToken({
            id: user._id,
          }),
        };
      }
    }
  }

  async authenticationLogin(body: any) {
    const user = await this.model
      .findOne({
        phoneNumber: body.phoneNumber,
      })
      .select('fullname email username password isSysAdmin');
    if (!user) {
      throw new HttpException('User Not Found', HttpStatus.METHOD_NOT_ALLOWED);
    } else {
      const isMatch = await user.isPasswordMatch(body.password, user.password);
      // Invalid password
      if (!isMatch) {
        throw new HttpException(
          'User Not Found',
          HttpStatus.METHOD_NOT_ALLOWED,
        );
      } else {
        return await {
          fullName: user.fullName,
          token: this.authService.generateToken({
            id: user._id,
          }),
        };
      }
    }
  }

  async authorizationLogin(body: any) {
    const user = await this.model
      .findOne({
        phoneNumber: body.phoneNumber,
      })
      .select('fullname email username password isSysAdmin');
    if (!user) {
      throw new HttpException('User Not Found', HttpStatus.METHOD_NOT_ALLOWED);
    } else {
      const isMatch = await user.isPasswordMatch(body.password, user.password);
      // Invalid password
      if (!isMatch) {
        throw new HttpException(
          'User Not Found',
          HttpStatus.METHOD_NOT_ALLOWED,
        );
      } else {
        return await {
          fullName: user.fullName,
          token: this.authService.generateToken({
            id: user._id,
          }),
        };
      }
    }
  }

  async register(body: any) {
    const user = await this.model.findOne({
      phoneNumber: body.phoneNumber,
    });
    if (user) {
      throw new HttpException(
        'Error, Email or Phone Number is already in use',
        HttpStatus.METHOD_NOT_ALLOWED,
      );
    } else {
      const userObject = {
        email: body.email,
        phoneNumber: body.phoneNumber,
        fullName: user.fullName,
        password: body.password,
      };
      return await this.model.create(userObject);
    }
  }
}