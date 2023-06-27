import { Injectable } from '@nestjs/common';
import { createTransport } from 'nodemailer';
import { ConfigService } from '../config/services/config.service';


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


    async sendConfirmationEmail(name, confirmationCode, email) {
        return await this.transport.sendMail({
            from: this.user,
            to: email,
            subject: "Please confirm your account",
            html: `<h1>Email Confirmation</h1>
                <h2>Hello ${name}</h2>
                <p>Thank you for signing up. Please confirm your email by clicking on the following link</p>
                <a href=http://localhost:3000/api/auth/confirm/${confirmationCode}> Click here</a>
                </div>`,
        })
    }
}