import { Controller, Body, Post, HttpStatus, HttpCode, UseGuards, HttpException,Request, UseInterceptors, UploadedFiles, Get } from '@nestjs/common';
import { ApiCreatedResponse, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

import { AuthService } from '../services/auth.service';
import { Auth } from '../interfaces/auth.dto';
import { AdminRegister } from '../interfaces/adminRegister.interface';
import { AdminRegisterDTO } from '../interfaces/adminRegister.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiCreatedResponse({
    type: Auth,
  })
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: Auth) {
    return await this.authService.login(body);
  }

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

  @Post('authenticationLogin')
  @ApiCreatedResponse({
    type: Auth,
  })
  @HttpCode(HttpStatus.OK)
  async authenticationLogin(@Body() body: Auth) {
    return await this.authService.authenticationLogin(body);
  }

  @Post('authorizationLogin')
  @ApiCreatedResponse({
    type: Auth,
  })
  @HttpCode(HttpStatus.OK)
  async authorizationLogin(@Body() body: Auth) {
    return await this.authService.authorizationLogin(body);
  }

  @Post('register')
  @ApiCreatedResponse({
    type: Auth,
  })
  @HttpCode(HttpStatus.OK)
  async register(@Body() body: any) {
    return await this.authService.register(body);
  }

  @Post('admin-register')
  @ApiCreatedResponse({
    type: AdminRegisterDTO,
  })
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      dest: './uploads',
      storage: diskStorage({
        destination: function (req, file, cb) {
          cb(null, './uploads');
        },
        filename: function (req, file, cb) {
          cb(
            null,
            Date.now() +
            'expirest' +
            Date.now() +
            '.' +
            file.mimetype.split('/')[1],
          );
        },
      }),
    }),
  )
  async create(@UploadedFiles() files: any, @Body() body: AdminRegister) {
    let filesMap = {
      files: files.map((file: any) => {
        return { src: file.filename };
      }),
    };
    return await this.authService.adminRegister(body,filesMap);

  }
}