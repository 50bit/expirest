import {
  Controller,
  Post,
  Body,
  Put,
  Param,
  HttpStatus,
  HttpException,
  Get,
  UseGuards,
  Request,
  Query,
  HttpCode,
  Headers,
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CrudController } from '../../../common/crud/controllers/crud.controller';
import { ObjectIdType } from '../../../common/utils/db.utils';
import { isEmpty } from 'lodash';
import { User } from 'src/auth/interfaces/user.dto';
import { AddUser } from 'src/auth/user/interfaces/addUser.dto';
import { ChangePassword } from '../interfaces/changePassword.dto';

@ApiTags('User')
@Controller('user')
@ApiBearerAuth('access-token')
// @UseGuards(AuthGuard('jwt'))
export class UserController  {
  constructor(public readonly usersService: UserService) {
  }

  @Get('currentUser')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  async getProfile(@Request() req: any) {
    return await this.usersService.findOne({ _id: req.user.id });
  }

  @Put()
  @UseGuards(AuthGuard('jwt'))
  @ApiCreatedResponse({
    description: 'User has been successfully updated.',
    type: User,
  })
  async update(@Request() req: any, @Body() body: any) {
    const id = req.user.id;
    let emailExists = false;
    if (body.email) {
      const user = await this.usersService.findOne({
        $and: [
          { email: body.email },
          { _id: { $ne: new ObjectIdType(id) } },
        ],
      });

      emailExists = !isEmpty(user);
    }
    if (!emailExists) {
      await this.usersService.update({ _id: id }, { $set: { ...body } });
      return await this.usersService.findOne({ _id: id });
    }
    return new HttpException(
      "You Can't Use This Email",
      HttpStatus.METHOD_NOT_ALLOWED,
    );
  }

  @Post('send-change-password-code')
  @HttpCode(HttpStatus.OK)
  async sendChangePassCode(@Body() body:any) {
    return await this.usersService.sendChangePassCode(body);
  }

  @Post('change-password/:id')
  @HttpCode(HttpStatus.OK)
  async changePassword(@Body() body:ChangePassword,@Param('id') id: string) {
    return await this.usersService.changePassword(body,id);
  }

  @Post('add-user')
  @ApiCreatedResponse({
    type: AddUser,
  })
  @HttpCode(HttpStatus.OK)
  async addUser(@Body() body: any) {
    return await this.usersService.addUser(body);
  }

}