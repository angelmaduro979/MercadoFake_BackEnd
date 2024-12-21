import email_transporter from "./emailTransporter.helpers.js";
import environment from "../../config/environment.js";
import path from 'path';
import fs from "fs"

const emailSender= async (to, subject, name, linkVerify, rutaHTMLtemplate, imagenEmail)=>{
    try{
        let htmlTemplate= fs.readFileSync(rutaHTMLtemplate, 'utf-8')
        htmlTemplate=htmlTemplate.replace('{{name}}', name);
        htmlTemplate=htmlTemplate.replace("{{verificationUrl}}",linkVerify)
        const emailSenderPayload={
            from: environment.user,
            to: to,
            subject: subject,
            html: htmlTemplate,
            attachments: [
                {
                    filename: 'imageEmail.png',
                    path: path.resolve(imagenEmail),
                    cid: 'emailPicture'
                }
            ]
        }
        const send_email=await email_transporter.sendMail(emailSenderPayload)
        return send_email
    }
    catch(error){
        console.error('Error sending email', error)
        throw error;
    }
}

export default emailSender;