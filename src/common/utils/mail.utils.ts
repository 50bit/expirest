import { Injectable } from '@nestjs/common';
import { createTransport } from 'nodemailer';
import { ConfigService } from '../config/services/config.service';
const registerTemplate = `
    <p>Thank you for joining Expirest.</p>
    <p>Please use the verification code below to complete the signing up process.</p> 
`
const forgetPassTemplate = `
<p>Please use the verification code below to complete the password reseting process.</p> 
`

@Injectable()
export class MailUtils {
    constructor(
        private readonly configService: ConfigService,
    ) {
    }

    public user = this.configService.get('MAIL_USER');
    public pass = this.configService.get('MAIL_PASS');

    public transport = createTransport({
        service: "gmail",
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        logger:true,
        debugger:true,
        secureConnection:false,
        auth: {
            user: this.user,
            pass: this.pass,
        },
        tls:{
            rejectUnAuthorized:true
        }
    });


    async sendVerificationEmail(name, verificationCode, email,useForgetPassTemplate=false) {
        const userName = name.split(' ')
        return await this.transport.sendMail({
            from: this.user,
            to: email,
            subject: "Please confirm your account",
            html: `<h1>Email Confirmation</h1>
                <div>
                    <h2>Hello ${userName[0]}</h2>
                    ${useForgetPassTemplate ? forgetPassTemplate : registerTemplate }
                    <h2>${verificationCode}</h2>
                </div>`,
        })
    }

    async sendRandomGeneratedPasswordEmail(name, password, email) {
        const userName = name.split(' ')
        return await this.transport.sendMail({
            from: this.user,
            to: email,
            subject: "Your Expirest Password",
            html: `<h1>Expirest Password</h1>
                <div>
                    <h2>Hello ${userName[0]}</h2>
                    <p>Thank you for joining Expirest.</p>
                    <p>This is your Expirest password please make sure to change it after your first login</p>
                    <h2>${password}</h2>
                </div>`,
        })
    }
}