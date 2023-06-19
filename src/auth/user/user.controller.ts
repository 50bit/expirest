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
  import { UserService } from './user.service';
  import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
  import { AuthGuard } from '@nestjs/passport';
  import { CrudController } from '../../common/crud/controllers/crud.controller';
  import { ObjectIdType } from '..//../common/utils/db.utils';
  
  @ApiTags('Users')
  @Controller('users')
  @ApiBearerAuth('access-token')
  // @UseGuards(AuthGuard('jwt'))
  export class UserController extends CrudController {
    constructor(public readonly usersService: UserService) {
      super(usersService);
    }
  
    @Get('currentUser')
    @UseGuards(AuthGuard('jwt'))
    @HttpCode(HttpStatus.OK)
    async getProfile(@Request() req: any) {
      return await this.usersService.findOne({ _id: req.user.id });
    }
  
    @Put(':id')
    @ApiCreatedResponse({
      description: 'User has been successfully updated.',
    })
    async update(@Param('id') id: string, @Body() body: any) {
      let phoneNumberExists = false;
      if (body.phoneNumber) {
        const user = await this.usersService.find({
          $and: [
            { phoneNumber: body.phoneNumber },
            { _id: { $ne: new ObjectIdType(id) } },
          ],
        });
  
        phoneNumberExists = user.length > 0 ? true : false;
      }
      if (!phoneNumberExists) {
        await this.usersService.update({ _id: id }, { $set: { ...body } });
        return await this.usersService.findOne({ _id: id });
      }
      throw new HttpException(
        "You Can't Use This Phone Number",
        HttpStatus.METHOD_NOT_ALLOWED,
      );
    }
  
    @Put()
    @UseGuards(AuthGuard('jwt'))
    @ApiCreatedResponse({
      description: 'User has been successfully updated.',
    })
    async updateInternal(@Request() req: any, @Body() body: any) {
      let phoneNumberExists = false;
      if (body.phoneNumber) {
        const user = await this.usersService.find({
          $and: [
            { phoneNumber: body.phoneNumber },
            { _id: { $ne: new ObjectIdType(req.user.id) } },
          ],
        });
  
        phoneNumberExists = user.length > 0 ? true : false;
      }
      if (!phoneNumberExists) {
        await this.usersService.update(
          { _id: req.user.id },
          { $set: { ...body } },
        );
        return await this.usersService.findOne({ _id: req.user.id });
      }
      throw new HttpException(
        "You Can't Use This Phone Number",
        HttpStatus.METHOD_NOT_ALLOWED,
      );
    }
  }