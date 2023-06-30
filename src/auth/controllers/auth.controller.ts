import { Controller,Headers , Body, Post, HttpStatus, HttpCode, UseGuards, HttpException,Request, UseInterceptors, UploadedFiles, Get, UploadedFile, Param, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

import { AuthService } from '../services/auth.service';
import { Auth } from '../interfaces/auth.dto';
import { AdminRegister } from '../interfaces/adminRegister.dto';
import { FileFieldsInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Login } from '../interfaces/loginResponse.dto';
import { User } from '../interfaces/user.dto';
import { Register } from '../interfaces/register.dto';
import { AddUser } from '../interfaces/addUser.dto';
import { ChangePassword } from '../interfaces/changePassword.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('authorize')
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  async authorize(@Request() req:any) {
    if (req.user) {
      return { status: 200, message: 'Authorized' };
    } else {
      return new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
  }

  @Post('login')
  @ApiCreatedResponse({
    type: Login,
  })
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: Auth) {
    return await this.authService.login(body);
  }

  @Post('send-change-password-code')
  @HttpCode(HttpStatus.OK)
  async sendChangePassCode(@Body() body:any) {
    return await this.authService.sendChangePassCode(body);
  }

  @Post('changePassword')
  @HttpCode(HttpStatus.OK)
  async changePassword(@Body() body:ChangePassword) {
    return await this.authService.changePassword(body);
  }

  @Post('add-user')
  @ApiCreatedResponse({
    type: AddUser,
  })
  @HttpCode(HttpStatus.OK)
  async addUser(@Body() body: {"email":any}) {
    return await this.authService.addUser(body);
  }

  @Post('user-register')
  @ApiCreatedResponse({
    type: User,
  })
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'pharmacyLiscence', maxCount: 1 },
      { name: 'pharmacistId', maxCount: 1 },
    ],{
      dest: './uploads',
      storage: diskStorage({
        destination: function (req, file, cb) {
          cb(null, `./uploads/${file.fieldname}`);
        },
        filename: function (req, file, cb) {
          cb(
            null,
            'expirest' +
            '-' +
            file.originalname.replace(".pdf","") +
            '-' +
            Date.now() +
            '.' +
            file.mimetype.split('/')[1],
          );
        },
      }),
    }),
  )
  async register(@UploadedFiles() files: {pharmacistId?: Express.Multer.File},@Body() body: Register, @Headers() headers) {
    const lang = (headers['accept-language'] == 'en' || headers['accept-language'] == 'ar'
    ? headers['accept-language']
    : 'multiLang');
    let filesMap = {
      pharmacistId:files.pharmacistId[0].filename
    };
    return await this.authService.register(body,filesMap,lang);
  }

  @Get('confirm/:id/:verficationCode')
  @HttpCode(HttpStatus.OK)
  async confirm(@Param('id') id: string,@Param('verficationCode') verficationCode: string,@Res() res: Response) {
    return await this.authService.confirm(id,verficationCode);
  }

  @Post('admin-register')
  @ApiCreatedResponse({
    type: User,
  })
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'pharmacyLiscence', maxCount: 1 },
      { name: 'pharmacistId', maxCount: 1 },
    ],{
      dest: './uploads',
      storage: diskStorage({
        destination: function (req, file, cb) {
          cb(null, `./uploads/${file.fieldname}`);
        },
        filename: function (req, file, cb) {
          cb(
            null,
            'expirest' +
            '-' +
            file.originalname.replace(".pdf","") +
            '-' +
            Date.now() +
            '.' +
            file.mimetype.split('/')[1],
          );
        },
      }),
    }),
  )
  async create(@UploadedFiles() files: { pharmacyLiscence?: Express.Multer.File, pharmacistId?: Express.Multer.File}, @Body() body: AdminRegister, @Headers() headers) {
    const lang = (headers['accept-language'] == 'en' || headers['accept-language'] == 'ar'
    ? headers['accept-language']
    : 'multiLang');
    let filesMap = {
      pharmacyLiscence:files.pharmacyLiscence[0].filename,
      pharmacistId:files.pharmacistId[0].filename
    };
    return await this.authService.adminRegister(body,filesMap,lang);
  }
}