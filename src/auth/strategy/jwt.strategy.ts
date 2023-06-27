import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '../../common/config/services/config.service';
import { ExtractJwt, Strategy } from 'passport-jwt';
import * as jwt from 'jsonwebtoken';
import { UserService } from '../user/services/user.service';
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly config: ConfigService, 
    private usersService: UserService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        ExtractJwt.fromUrlQueryParameter('access_token'),
      ]),
      secretOrKey: config.get('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    return { ...payload };
  }

  async verify(token: string) {
    try {
      const payload = <any>jwt.verify(token, this.config.get('JWT_SECRET'));
      const user = await this.usersService.findOne({ _id: payload.id });
      if (!user) {
        throw new HttpException('Unauthorized access', HttpStatus.BAD_REQUEST);
      }
      return user;
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }
}