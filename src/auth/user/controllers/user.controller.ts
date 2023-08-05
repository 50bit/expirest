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
  UseInterceptors,
  UploadedFiles,
  Delete,
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CrudController } from '../../../common/crud/controllers/crud.controller';
import { ObjectIdType } from '../../../common/utils/db.utils';
import { isEmpty } from 'lodash';
import { User } from 'src/auth/interfaces/user.dto';
import { AddUser } from 'src/auth/user/interfaces/addUser.dto';
import { ChangePassword } from '../interfaces/changePassword.dto';
import { aggregationPipelineConfig } from '../schemas/user.schema';
import { aggregationMan } from 'src/common/utils/aggregationMan.utils';
import { Register } from 'src/auth/interfaces/register.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import fs from 'fs';
import { UpdateUser } from '../interfaces/updateUser.dto';

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
  async getProfile(@Request() req: any, @Headers() headers) {
    const lang = (headers['accept-language'] == 'en' || headers['accept-language'] == 'ar'
      ? headers['accept-language']
      : 'multiLang');
    const pipelineConfig = aggregationPipelineConfig(lang)
    const pipeline = aggregationMan(pipelineConfig, { _id: new ObjectIdType(req.user.id) })
    return (await this.usersService.aggregate(pipeline))[0];
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
    throw new HttpException(
      "You Can't Use This Email",
      HttpStatus.METHOD_NOT_ALLOWED,
    );
  }

  @Post('send-change-password-code')
  @HttpCode(HttpStatus.OK)
  @ApiBody({
    type: AddUser,
  })
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
    type: User,
  })
  @ApiBody({
    type: AddUser,
  })
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'))
  async addUser(@Request() req , @Body() body: AddUser) {
    const pharmacyId = req.user.pharmacyId
    body['pharmacyId'] = new ObjectIdType(pharmacyId);
    return await this.usersService.addUser(body);
  }

  @Put()
  @ApiCreatedResponse({
    type: User,
  })
  @ApiBody({
    type: UpdateUser,
  })
  @HttpCode(HttpStatus.OK)
  async UpdateUser(@Request() req ,@Body() body: UpdateUser, @Headers() headers) {
    const lang = (headers['accept-language'] == 'en' || headers['accept-language'] == 'ar'
      ? headers['accept-language']
      : 'multiLang');

    const userId = req.user.id;
    return await this.usersService.updateUser(userId,body,lang);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteUser(@Param('id') id: string) {
    return await this.usersService.deleteUser(id);
  }

}