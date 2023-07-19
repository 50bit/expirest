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
import { aggregationPipelineConfig as  pharmacyAggregationPipelineConfig } from 'src/modules/pharmacy/schemas/pharmacy.schema';
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
                    email: 'admin@mail.com',
                    pharmacyId: '000000000000000000000000',
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
                    body.password.toString(),
                    user.password.toString(),
                );
                // Invalid password
                if (!isMatch) {
                    throw new HttpException(
                        'Error, Invalid User or Password',
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
                            email: user.email,
                            pharmacyId: user.pharmacyId
                        }),
                    };
                }
            }
        }
    }

    async login(body: any,lang:string) {
        const user = await this.userModel.findOne({
            email: body.email,
        }, { "password": 1, "email": 1, "fullName": 1, "activatedByEmail": 1, "approved": 1, "pharmacyId": 1, "_id": 1 })

        if (!user) {
            throw new HttpException(
                'Error, Account not found',
                HttpStatus.METHOD_NOT_ALLOWED,
            );
        } else {
            const isMatch = await user.isPasswordMatch(body.password.toString(), user.password.toString());
            // Invalid password
            if (!isMatch) {
                throw new HttpException(
                    'Error, Invalid User or Password',
                    HttpStatus.METHOD_NOT_ALLOWED,
                );
            } else {
                if (!user.activatedByEmail) {
                    const verficationCode = random(10000, 99999)
                    try {
                        await this.mailUtils.sendVerificationEmail(user.fullName, verficationCode, user.email)
                        await this.userModel.updateOne({ _id: user._id }, { "$set": { "verficationCode": verficationCode } })
                    } catch (error) {
                        console.log(error)
                        throw new HttpException(
                            'Email is not valid or can\'t be reached',
                            HttpStatus.METHOD_NOT_ALLOWED,
                        );
                    }
                    throw new HttpException(
                        {
                            message: 'Please activate your email before signing in.\n A new verification code has been sent to your email',
                            data: {
                                userId: user._id,
                                email: user.email
                            }
                        },
                        HttpStatus.METHOD_NOT_ALLOWED,
                    );
                }
                if (!user.approved) {
                    throw new HttpException(
                        'Your account is not approved by the adminsitration yet.',
                        HttpStatus.METHOD_NOT_ALLOWED,
                    );
                }
                const pipelineConfig = pharmacyAggregationPipelineConfig(lang)
                const pipeline = aggregationMan(pipelineConfig, {_id:new ObjectIdType(user.pharmacyId)})
                const pharmacy = (await this.pharmacyModel.aggregate(pipeline))[0].name
                return await {
                    fullName: user.fullName,
                    isAdmin: user.isAdmin,
                    pharmacy,
                    token: await this.generateToken({
                        id: user._id,
                        fullName: user.fullName,
                        isAdmin: user.isAdmin,
                        email: user.email,
                        pharmacyId: user.pharmacyId
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
        return (await this.userModel.aggregate(pipeline))[0];
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
            throw new HttpException(
                'Pharmacy already exists, please contact the administration',
                HttpStatus.METHOD_NOT_ALLOWED,
            );

        const userExists = await this.userModel.findOne({
            email: user.email
        });

        if (userExists)
            throw new HttpException(
                'User already exists, please contact the administration',
                HttpStatus.METHOD_NOT_ALLOWED,
            );

        const verficationCode = random(10000, 99999)
        try {
            await this.mailUtils.sendVerificationEmail(user.fullName, verficationCode, user.email)
        } catch (error) {
            console.log(error)
            throw new HttpException(
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
        return (await this.userModel.aggregate(pipeline))[0];
    }

    async verify(id, verficationCode) {
        const user = await this.userModel.findOne({ "_id": id, "verficationCode": verficationCode })
        if (user) {
            await this.userModel.updateOne({ "_id": id }, { "$set": { "activatedByEmail": true } })
            let updatedUser = JSON.parse(JSON.stringify(user))
            updatedUser["activatedByEmail"] = true;
            return updatedUser
        }

        throw new HttpException(
            'Please make sure you are using a valid verification code',
            HttpStatus.METHOD_NOT_ALLOWED,
        );
    }

    async approve(id) {
        const user = await this.userModel.findOne({ "_id": id })
        if (user) {
            await this.userModel.updateOne({ "_id": id }, { "$set": { "approved": true } })
            let updatedUser = JSON.parse(JSON.stringify(user))
            updatedUser["approved"] = true;
            return updatedUser
        }

        throw new HttpException(
            'Please make sure the user exists',
            HttpStatus.METHOD_NOT_ALLOWED,
        );
    }

    async sendVerificationCode(id) {
        const user = await this.userModel.findOne({ _id: id })
        if (user) {
            const verficationCode = random(10000, 99999)
            try {
                await this.mailUtils.sendVerificationEmail(user.fullName, verficationCode, user.email)
                await this.userModel.updateOne({ _id: user._id }, { "$set": { "verficationCode": verficationCode } })
                return user
            } catch (error) {
                console.log(error)
                throw new HttpException(
                    'Email is not valid or can\'t be reached',
                    HttpStatus.METHOD_NOT_ALLOWED,
                );
            }
        } else {
            throw new HttpException(
                'Please make sure the user exists',
                HttpStatus.METHOD_NOT_ALLOWED,
            );
        }

    }
}