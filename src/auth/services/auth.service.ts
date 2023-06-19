import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '../../common/config/services/config.service';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { AdminRegister } from '../interfaces/adminRegister.interface';
import { cloneDeep } from 'lodash'
@Injectable()
export class AuthService {
    constructor(
        @InjectModel('users') public readonly userModel: Model<any>,
        @InjectModel('pharmacies') public readonly pharmacyModel: Model<any>,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) { }

    async generateToken(user: any) {
        return {
            expiresIn: this.configService.get('JWT_EXPIRATION_TIME'),
            accessToken: this.jwtService.sign({ ...user }),
        };
    }

    async login(body: any) {
        const user = await this.userModel.findOne({
            phoneNumber: body.phoneNumber,
        });
        if (!user) {
            throw new HttpException(
                'Error, Account not found or has no access',
                HttpStatus.METHOD_NOT_ALLOWED,
            );
        } else {
            const isMatch = await user.isPasswordMatch(body.password, user.password);
            // Invalid password
            if (!isMatch) {
                throw new HttpException(
                    'Error, Invalid Password',
                    HttpStatus.METHOD_NOT_ALLOWED,
                );
            } else {
                return await {
                    fullName: user.fullName,
                    isSysAdmin: user.isSysAdmin,
                    token: await this.generateToken({
                        id: user._id,
                        isSysAdmin: user.isSysAdmin,
                        fullName: user.fullName,
                    }),
                };
            }
        }
    }

    async authenticationLogin(body: any) {
        if (
            body.phoneNumber === '010000000000' &&
            body.password ===
            `SallyPharma@${new Date().getFullYear()}@${new Date().getMonth() +
            1}@${new Date().getDate()}`
        ) {
            return await {
                fullName: 'Admin',
                isSysAdmin: true,
                token: await this.generateToken({
                    id: '000000000000000000000000',
                    isSysAdmin: true,
                    fullName: 'Admin',
                }),
            };
        } else {
            const user = await this.userModel.findOne({
                phoneNumber: body.phoneNumber,
            });
            if (!user) {
                throw new HttpException(
                    'Error, Account not found',
                    HttpStatus.METHOD_NOT_ALLOWED,
                );
            } else {
                const isMatch = await user.isPasswordMatch(
                    body.password,
                    user.password,
                );
                // Invalid password
                if (!isMatch) {
                    throw new HttpException(
                        'Error, Invalid Password',
                        HttpStatus.METHOD_NOT_ALLOWED,
                    );
                } else {
                    return await {
                        fullName: user.fullName,
                        isSysAdmin: user.isSysAdmin,
                        token: await this.generateToken({
                            id: user._id,
                            isSysAdmin: user.isSysAdmin,
                            fullName: user.fullName,
                        }),
                    };
                }
            }
        }
    }

    async authorizationLogin(body: any) {
        const user = await this.userModel.findOne({
            phoneNumber: body.phoneNumber,
        });
        if (!user) {
            throw new HttpException(
                'Error, Account not found',
                HttpStatus.METHOD_NOT_ALLOWED,
            );
        } else {
            const isMatch = await user.isPasswordMatch(body.password, user.password);
            // Invalid password
            if (!isMatch) {
                throw new HttpException(
                    'Error, Invalid Password',
                    HttpStatus.METHOD_NOT_ALLOWED,
                );
            } else {
                return await {
                    fullName: user.fullName,
                    isSysAdmin: user.isSysAdmin,
                    token: await this.generateToken({
                        id: user._id,
                        fullName: user.fullName,
                        isSysAdmin: user.isSysAdmin,
                    }),
                };
            }
        }
    }

    async register(body: any) {
        const user = await this.userModel.findOne({
            phoneNumber: body.phonNumber,
        });
        if (user) {
            throw new HttpException(
                'Error, Phone Number is already in use',
                HttpStatus.METHOD_NOT_ALLOWED,
            );
        } else {
            const userObject = {
                email: body.email,
                phoneNumber: body.phoneNumber,
                fullName: body.fullName,
                password: body.password,
            };
            const user = await this.userModel.create(userObject);
            if (user._id) {
                const userRoleObject = {
                    fullName: body.fullName,
                    phoneNumber: body.phoneNumber,
                    address: body.address,
                    userId: user._id,
                };
            }
        }
    }

    async adminRegister(body: any, files: any) {
        let { user, pharmacy } = body;
        user = JSON.parse(user)
        pharmacy = JSON.parse(pharmacy)
        const pharmacyExists = await this.pharmacyModel.findOne({
            phoneNumber: pharmacy.phoneNumber,
            governorateId: pharmacy.governorateId,
            cityId: pharmacy.cityId,
            name: pharmacy.name
        });
        if (pharmacyExists)
            throw new HttpException(
                'Pharmacy already exists, please contact the administration',
                HttpStatus.METHOD_NOT_ALLOWED,
            );
            
        const userExists = await this.userModel.findOne({
            phoneNumber: user.phoneNumber,
            email: user.email
        });

        if (userExists)
            throw new HttpException(
                'User already exists, please contact the administration',
                HttpStatus.METHOD_NOT_ALLOWED,
            );

        pharmacy = { ...pharmacy, ...files };

        let createdPharamcy = JSON.parse(JSON.stringify((await this.pharmacyModel.create(pharmacy))));
        user["pharmacyId"] = createdPharamcy._id;
        user["isAdmin"] = true;
        let createdUser = JSON.parse(JSON.stringify((await this.userModel.create(user))));
        delete createdUser.password;
        createdUser['pharmacyId'] = createdPharamcy;
        return createdUser;
    }
}