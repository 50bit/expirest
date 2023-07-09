import { Controller, Headers, Body, Post, HttpStatus, HttpCode, UseGuards, HttpException, Request, UseInterceptors, UploadedFiles, Get, UploadedFile, Param, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiCreatedResponse, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

import { AuthService } from '../services/auth.service';
import { Auth } from '../interfaces/auth.dto';
import { AdminRegister } from '../interfaces/adminRegister.dto';
import { FileFieldsInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Login } from '../interfaces/loginResponse.dto';
import { User } from '../interfaces/user.dto';
import { Register } from '../interfaces/register.dto';
import fs from 'fs';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('authorize')
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  async authorize(@Request() req: any) {
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

  @Post('user-register')
  @ApiConsumes('multipart/form-data')
  @ApiCreatedResponse({
    type: User,
  })
  @ApiBody({
    type: Register,
  })
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'pharmacistId', maxCount: 1 },
    ], {
      dest: './uploads',
      storage: diskStorage({
        destination: function (req, file, cb) {
          const dir = `./uploads/${file.fieldname}`
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          cb(null, dir);
        },
        filename: function (req, file, cb) {
          cb(
            null,
            'expirest' +
            '-' +
            file.originalname.replace(".pdf", "") +
            '-' +
            Date.now() +
            '.' +
            file.mimetype.split('/')[1],
          );
        },
      }),
    }),
  )
  async register(@UploadedFiles() files: { pharmacistId?: Express.Multer.File }, @Body() body: Register, @Headers() headers) {
    const lang = (headers['accept-language'] == 'en' || headers['accept-language'] == 'ar'
      ? headers['accept-language']
      : 'multiLang');
    let filesMap = {
      pharmacistId: "pharmacistId/" + files.pharmacistId[0].filename
    };
    return await this.authService.register(body, filesMap, lang);
  }

  @Post('verify/:id/:verficationCode')
  @ApiCreatedResponse({})
  @HttpCode(HttpStatus.OK)
  async verify(@Param('id') id: string, @Param('verficationCode') verficationCode: string) {
    return await this.authService.verify(id, verficationCode);
  }

  @Post('admin-register')
  @ApiConsumes('multipart/form-data')
  @ApiCreatedResponse({
    type: User,
  })
  @ApiBody({
    type: AdminRegister,
  })
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'pharmacyLiscence', maxCount: 1 },
      { name: 'pharmacistId', maxCount: 1 },
    ], {
      dest: './uploads',
      storage: diskStorage({
        destination: function (req, file, cb) {
          const dir = `./uploads/${file.fieldname}`
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          cb(null, `./uploads/${file.fieldname}`);
        },
        filename: function (req, file, cb) {
          cb(
            null,
            'expirest' +
            '-' +
            file.originalname.replace(".pdf", "") +
            '-' +
            Date.now() +
            '.' +
            file.mimetype.split('/')[1],
          );
        },
      }),
    }),
  )
  async create(@UploadedFiles() files: { pharmacyLiscence?: Express.Multer.File, pharmacistId?: Express.Multer.File }, @Body() body: AdminRegister, @Headers() headers) {
    const lang = (headers['accept-language'] == 'en' || headers['accept-language'] == 'ar'
      ? headers['accept-language']
      : 'multiLang');
    let filesMap = {
      pharmacyLiscence: "pharmacyLiscence/" + files.pharmacyLiscence[0].filename,
      pharmacistId: "pharmacistId/" + files.pharmacistId[0].filename
    };
    return await this.authService.adminRegister(body, filesMap, lang);
  }

  @Post('approve/:id')
  @ApiCreatedResponse({})
  @HttpCode(HttpStatus.OK)
  async approve(@Param('id') id: string) {
    return await this.authService.approve(id);
  }
}