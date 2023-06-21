import { Controller, Body, Post, HttpStatus, HttpCode, UseGuards, HttpException,Request, UseInterceptors, UploadedFiles, Get, UploadedFile } from '@nestjs/common';
import { ApiCreatedResponse, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

import { AuthService } from '../services/auth.service';
import { Auth } from '../interfaces/auth.dto';
import { AdminRegisterDTO } from '../interfaces/adminRegister.dto';
import { FileFieldsInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Register } from '../interfaces/register.interface';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('authorize')
  @UseGuards(AuthGuard('jwt'))
  @ApiCreatedResponse({
    type: Auth,
  })
  @HttpCode(HttpStatus.OK)
  async authorize(@Request() req:any, @Body() body: String[]) {
    if (req.user ) {
      return { status: 200, message: 'Authorized' };
    } else {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
  }

  @Post('login')
  @ApiCreatedResponse({
    type: Auth,
  })
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: Auth) {
    return await this.authService.login(body);
  }

  @Post('register')
  @ApiCreatedResponse({
    type: Auth,
  })
  @HttpCode(HttpStatus.OK)
  async register(@Body() body: Register) {
    return await this.authService.register(body);
  }

  @Post('admin-register')
  @ApiCreatedResponse({
    type: AdminRegisterDTO,
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
          cb(null, './uploads');
        },
        filename: function (req, file, cb) {
          cb(
            null,
            'expirest' +
            '-' +
            file.originalname +
            '-' +
            Date.now() +
            '.' +
            file.mimetype.split('/')[1],
          );
        },
      }),
    }),
  )
  async create(@UploadedFiles() files: { pharmacyLiscence?: Express.Multer.File, pharmacistId?: Express.Multer.File}, @Body() body: AdminRegisterDTO) {
    let filesMap = {
      pharmacyLiscence:files.pharmacyLiscence[0].filename,
      pharmacistId:files.pharmacistId[0].filename
    };
    return await this.authService.adminRegister(body,filesMap);
  }
}