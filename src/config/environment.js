import dotenv from "dotenv";

dotenv.config();

const environment = {
    user: process.env.EMAIL_USER || '',
    password: process.env.EMAIL_PASSWORD || '',
    key: process.env.SECRET_KEY || '',
    url_fronted:process.env.URL_FRONTEND || '',
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME || '',
    api_key:process.env.CLOUDINARY_API_KEY || '',
    api_secret:process.env.CLOUDINARY_API_SECRET || '',
    session_secret:process.env.SESSION_KEY || ''
}

export default environment;
