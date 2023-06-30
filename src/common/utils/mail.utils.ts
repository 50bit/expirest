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


    async sendConfirmationEmail(name, confirmationCode, email,useForgetPassTemplate=false) {
        return await this.transport.sendMail({
            from: this.user,
            to: email,
            subject: "Please confirm your account",
            html: `<h1>Email Confirmation</h1>
                <div>
                    <h2>Hello ${name}</h2>
                    ${useForgetPassTemplate ? forgetPassTemplate : registerTemplate }
                    <h2>${confirmationCode}</h2>
                </div>`,
        })
    }
}