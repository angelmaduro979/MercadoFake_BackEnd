import nodemailer from 'nodemailer';
import environment from '../../config/environment.js';

const payloadTransporter={
    service: 'Gmail',
    host: 'smtp.gmail.com',    
    port: 587,                
    secure: false,             
    tls: {
        rejectUnauthorized: false
    },
    auth:{
        user: environment.user,
        pass: environment.password
    }
    
}
const email_transporter= nodemailer.createTransport(payloadTransporter)

export default email_transporter;