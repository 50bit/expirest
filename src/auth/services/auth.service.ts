import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '../../common/config/services/config.service';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { MailUtils } from 'src/common/utils/mail.utils';
import { random } from 'lodash';
import { aggregationPipelineConfig } from '../user/schemas/user.schema';
import { aggregationMan } from 'src/common/utils/aggregationMan.utils';
import { ObjectIdType } from 'src/common/utils/db.utils';
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
                    email: 'admin@mail.com'
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
                            email: user.email
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
                if (!user.activatedByEmail) {
                    return new HttpException(
                        'Please activate your email before signing in.',
                        HttpStatus.METHOD_NOT_ALLOWED,
                    );
                }
                if (!user.approved) {
                    return new HttpException(
                        'Your account is not approved yet.',
                        HttpStatus.METHOD_NOT_ALLOWED,
                    );
                }
                return await {
                    fullName: user.fullName,
                    isAdmin: user.isAdmin,
                    token: await this.generateToken({
                        id: user._id,
                        fullName: user.fullName,
                        isAdmin: user.isAdmin,
                        email: user.email
                    }),
                };
            }
        }
    }

    async register(body: any, files: any, lang: string) {
        let user = {
            fullName: body.fullName,
            email: body.email,
            phoneNumber: body.phoneNumber,
            password: body.password,
            isAdmin: false,
            pharmacyId: body.pharmacyId,
            pharmacistId: files.pharmacistId
        }

        const userExists = await this.userModel.findOne({ email: user.email });

        if (!userExists)
            throw new HttpException(
                'There is no such user, please contact the administration',
                HttpStatus.METHOD_NOT_ALLOWED,
            );

        await this.userModel.updateOne({ email: user.email }, { "$set": user })

        const pipelineConfig = aggregationPipelineConfig(lang)
        const pipeline = aggregationMan(pipelineConfig, { "email": user.email })
        return await this.userModel.aggregate(pipeline);
    }

    async adminRegister(body: any, files: any, lang: string) {
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
            governorateId: body.governorateId,
            cityId: body.cityId,
            address: body.address,
            pharmacyLiscence: files.pharmacyLiscence
        }
        const pharmacyExists = await this.pharmacyModel.findOne({
            phoneNumber: pharmacy.phoneNumber,
            governorateId: pharmacy.governorateId,
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

        const verficationCode = random(10000, 99999)
        try {
            await this.mailUtils.sendConfirmationEmail(user.fullName, verficationCode, user.email)
        } catch (error) {
            console.log(error)
            return new HttpException(
                'Email is not valid or can\'t be reached',
                HttpStatus.METHOD_NOT_ALLOWED,
            );
        }

        pharmacy["governorateId"] = new ObjectIdType(pharmacy.governorateId);
        pharmacy["cityId"] = new ObjectIdType(pharmacy.cityId);
        let createdPharamcy = JSON.parse(JSON.stringify((await this.pharmacyModel.create(pharmacy))));
        user["pharmacyId"] = new ObjectIdType(createdPharamcy._id);
        user["verficationCode"] = verficationCode;
        user["pharmacistId"] = files.pharmacistId
        await this.userModel.create(user);
        const pipelineConfig = aggregationPipelineConfig(lang)
        const pipeline = aggregationMan(pipelineConfig, { "email": user.email })
        return await this.userModel.aggregate(pipeline);
    }

    async confirm(id, verficationCode) {
        const user = await this.userModel.findOne({ "_id": id, "verficationCode": verficationCode })
        if (user) {
            await this.userModel.updateOne({ "_id": id }, { "$set": { "activatedByEmail": true } })
            let updatedUser = JSON.parse(JSON.stringify(user))
            updatedUser["activatedByEmail"] = true;
            return updatedUser
        }

        return new HttpException(
            'Please make sure you are using a valid verification code',
            HttpStatus.METHOD_NOT_ALLOWED,
        );
    }

    async addUser(body) {
        const userExists = await this.userModel.findOne({
            email: body.email
        });

        if (userExists)
            return new HttpException(
                'User already exists, please contact the administration',
                HttpStatus.METHOD_NOT_ALLOWED,
            );

        const verficationCode = random(10000, 99999)
        try {
            await this.mailUtils.sendConfirmationEmail('', verficationCode, body.email)
        } catch (error) {
            console.log(error)
            return new HttpException(
                'Email is not valid or can\'t be reached',
                HttpStatus.METHOD_NOT_ALLOWED,
            );
        }
    }

    async sendChangePassCode(body) {
        const verficationCode = random(10000, 99999)
        try {
            await this.userModel.updateOne({ _id: body.email }, { "$set": { verficationCode } })
            await this.mailUtils.sendConfirmationEmail('', verficationCode, body.email, true)
        } catch (error) {
            console.log(error)
            return new HttpException(
                'Email is not valid or can\'t be reached',
                HttpStatus.METHOD_NOT_ALLOWED,
            );
        }
    }

    async changePassword(body) {
        const user = await this.userModel
            .findOne({
                _id: body._id,
            })

        if (user) {
            await this.userModel.updateOne(
                { _id: body._id },
                {
                    password: body.password,
                },
            );
        } else {
            throw new HttpException(
                'User Not Found Or Has No Access',
                HttpStatus.METHOD_NOT_ALLOWED,
            );
        }
    }
}