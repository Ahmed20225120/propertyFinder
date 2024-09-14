import nodemailer, { Transporter , SendMailOptions} from "nodemailer";
import {config} from "dotenv";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { MailBody } from "../interfaces/mail/mailBody.interface";

config();

export class MailHandler
{
    private static transporter: Transporter;
    private static host : string = process.env.MAILTRAP_HOST ?? "smtp.mailtrap.io";
    private static port : number = (process.env.MAILTRAP_PORT as unknown as number) || 465;
    private static userAuth : string = process.env.MAILTRAP_USER ?? "";
    private static userPass : string = process.env.MAILTRAP_PASS ?? "";
    private static server_mail : string = process.env.SERVER_EMAIL ?? "";

    private static getTransporter(): Transporter
    {
        if (!this.transporter)
        {
            this.transporter = nodemailer.createTransport({
                host: this.host,
                port: this.port,
                secure: false,
                auth: {
                    user: this.userAuth,
                    pass: this.userPass
                }
            });
        }
        return this.transporter;
    }

    private static mailOptionsBuilder(mailBody: MailBody): SendMailOptions
    {
        let mailOptions : SendMailOptions = 
        {
            from: this.server_mail,
            ...mailBody
        };

        return mailOptions;
    }
    public static sendMail(mailData: MailBody): boolean
    {
        let isSent : boolean = false;

        const mailOptions = this.mailOptionsBuilder(mailData);
        this.getTransporter().sendMail(mailOptions, (error: any, info: any) => 
        {
            if (error)
            {
                console.error(error.message);
                return isSent;
            }

            console.log("Email sent: " + info.response);
            isSent = true;
        });

        return isSent;
    }

}