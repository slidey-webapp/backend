import { MAIL_HOST, MAIL_PORT, MAIL_SECURE } from "../config/nodemailer";
const nodemailer = require("nodemailer");
import * as handlebars from "handlebars";
import * as fs from "fs";
import * as path from "path";
import { APP_EMAIL, APP_EMAIL_PASSWORD, APP_NAME, ENVIRONMENT } from "../config/contants";
export const sendEmail = async ({ emailTo, text, subject, replyID, attachments, htmlData }) => {
    try {
        const transporter = nodemailer.createTransport({
            host: MAIL_HOST,
            port: MAIL_PORT,
            secure: MAIL_SECURE,
            auth: {
                user: APP_EMAIL,
                pass: APP_EMAIL_PASSWORD,
            },
        });
        let htmlToSend = null,
            htmlFileToSend = null;
        if (htmlData) {
            const isProduction = process.env.NODE_ENV === ENVIRONMENT.PRODUCTION;
            const __dirname = path.resolve() + isProduction ? "dist" : "src";
            const filePath = path.join(__dirname, htmlData.dir);
            const source = fs.readFileSync(filePath, "utf-8").toString();
            const template = handlebars.compile(source);

            htmlToSend = template(htmlData.replace);
            if (htmlData.image)
                htmlFileToSend = [
                    {
                        filename: htmlData.image.name,
                        path: __dirname + htmlData.image.dir,
                        cid: htmlData.image.cid,
                    },
                ];
        }
        await transporter.sendMail({
            from: {
                name: APP_NAME,
                address: APP_EMAIL,
            },
            to: emailTo,
            subject: subject,
            text: text,
            ...(replyID && { inReplyTo: replyID, references: [replyID] }),
            attachments: htmlFileToSend ?? attachments,
            ...(htmlToSend && { html: htmlToSend }),
        });
        console.log("Email sent Successfully");
    } catch (error) {
        console.log("Email not sent");
        console.log(error);
    }
};
