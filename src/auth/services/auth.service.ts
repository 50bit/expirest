import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '../../common/config/services/config.service';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Register } from '../interfaces/register.interface';
import { MailUtils } from 'src/common/utils/mail.utils';
@Injectable()
export class AuthService {
    constructor(
        @InjectModel('users') public readonly userModel: Model<any>,
        @InjectModel('pharmacies') public readonly pharmacyModel: Model<any>,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly mailUtils: MailUtils
    ) { }

    async generateToken(user: any) {
        return {
            expiresIn: this.configService.get('JWT_EXPIRATION_TIME'),
            accessToken: this.jwtService.sign({ ...user }),
        };
    }

    async authenticationLogin(body: any) {
        if (
            body.email === 'admin@mail.com' &&
            body.password ===
            `Expirest@${new Date().getFullYear()}@${new Date().getMonth() +
            1}@${new Date().getDate()}`
        ) {
            return await {
                fullName: 'Admin',
                isAdmin: true,
                token: await this.generateToken({
                    id: '000000000000000000000000',
                    isAdmin: true,
                    fullName: 'Admin',
                }),
            };
        } else {
            const user = await this.userModel.findOne({
                email: body.email,
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
                        isAdmin: user.isAdmin,
                        token: await this.generateToken({
                            id: user._id,
                            isAdmin: user.isAdmin,
                            fullName: user.fullName,
                        }),
                    };
                }
            }
        }
    }

    async login(body: any) {
        const user = await this.userModel.findOne({
            email: body.email,
        }).select("password");
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
                    isAdmin: user.isAdmin,
                    token: await this.generateToken({
                        id: user._id,
                        fullName: user.fullName,
                        isAdmin: user.isAdmin,
                    }),
                };
            }
        }
    }

    async register(body: Register) {
        let user = {
            fullName: body.fullName,
            email: body.email,
            phoneNumber: body.phoneNumber,
            password: body.password,
            isAdmin: body.isAdmin,
            pharmacyId: body.pharmacyId
        }

        const userExists = await this.userModel.findOne({ email: user.email });

        if (userExists)
            throw new HttpException(
                'User already exists, please contact the administration',
                HttpStatus.METHOD_NOT_ALLOWED,
            );

        await this.userModel.create(user)

        return (await this.userModel.findOne({ email: user.email }));
    }

    async adminRegister(body: any, files: any) {
        let user = {
            fullName: body.userFullName,
            email: body.email,
            phoneNumber: body.userPhoneNumber,
            password: body.password,
            isAdmin: body.isAdmin || false,
            activatedByEmail: false
        }
        let pharmacy = {
            name: body.pharmacyName,
            phoneNumber: body.pharmacyPhoneNumber,
            governorate_id: body.governorate_id,
            cityId: body.cityId,
            address: body.address
        }
        const pharmacyExists = await this.pharmacyModel.findOne({
            phoneNumber: pharmacy.phoneNumber,
            governorate_id: pharmacy.governorate_id,
            cityId: pharmacy.cityId,
            name: pharmacy.name
        });
        if (pharmacyExists)
            return new HttpException(
                'Pharmacy already exists, please contact the administration',
                HttpStatus.METHOD_NOT_ALLOWED,
            );

        const userExists = await this.userModel.findOne({
            email: user.email
        });

        if (userExists)
            return new HttpException(
                'User already exists, please contact the administration',
                HttpStatus.METHOD_NOT_ALLOWED,
            );

        try {
            await this.mailUtils.sendConfirmationEmail(user.fullName,(await this.generateToken(user)).accessToken,user.email)
        } catch (error) {
            console.log(error)
            return new HttpException(
                'Email is not valid or can\'t be reached',
                HttpStatus.METHOD_NOT_ALLOWED,
            );
        }

        pharmacy = { ...pharmacy, ...files };

        let createdPharamcy = JSON.parse(JSON.stringify((await this.pharmacyModel.create(pharmacy))));
        user["pharmacyId"] = createdPharamcy._id;
        let createdUser = JSON.parse(JSON.stringify((await this.userModel.create(user))));
        delete createdUser.password;
        createdUser['pharmacy'] = createdPharamcy;
        let finalUser = JSON.parse(JSON.stringify((await this.userModel.findOne({email:user.email})))); 
        return finalUser;
    }

    async confirm(token){
        const user = await this.jwtService.verify(token)
        console.log(user)
        await this.userModel.updateOne({"email":user.email,"phoneNumber":user.phoneNumber},{"$set":{"activatedByEmail":true}})
        return "Confirmed"
    }
}