import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinaryConfig.js";
import ResponseBuilder from "../builders/responseBuilder.js";


const cloudinary_payload = {
    cloudinary,
    params: {
        folder: 'ecommerce_project',
        allowed_formats: ['jpg', 'png', 'jpeg']
    }
}

const storage = new CloudinaryStorage(cloudinary_payload)

const cloudinaryUpload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedFormats = ['image/jpeg', 'image/png', 'image/jpg'];
        const isInvalidFormat = !allowedFormats.includes(file.mimetype)
        if (isInvalidFormat) {
            const error_message = '¡La imagen ingresada en el campo debe ser jpeg, jpg, o png!'
            return cb(new Error(error_message))
        }
        cb(null, true)

    },
    limits: { fileSize: 5 * 1024 * 1024 }//5MB
}).array('image', 3);

const cloudinaryMiddleware = (req, res, next) => {
    console.log('Request recibido:', req.body, req.files);
    cloudinaryUpload(req, res, (err) => {
        if (err) {
            console.error('Error al procesar los archivos:', err.message);
            if (err instanceof multer.MulterError) {
                
                return res.status(400).json(
                    new ResponseBuilder()
                        .setStatus(400)
                        .setOk(false)
                        .setError('MULTER_ERROR')
                        .setMessage({ error_message: err.message })
                        .build()
                );
            } else {
              
                return res.status(400).json(
                    new ResponseBuilder()
                        .setStatus(400)
                        .setOk(false)
                        .setError('CLOUDINARY_ERROR')
                        .setMessage({ error_message: err.message })
                        .build()
                );
            }
        }
        

        if (!req.files || req.files.length === 0) {
            console.warn('No se recibieron archivos.')
            req.body.uploadedImages = []
            return res.status(400).json(
                new ResponseBuilder()
                    .setStatus(400)
                    .setOk(false)
                    .setError('CLOUDINARY_ERROR')
                    .setMessage({ error_message: 'No images were uploaded' })
                    .build()
            );

        }
        console.log('Archivos procesados:', req.files);
          
        req.body.uploadedImages = req.files.map((file) => ({
            url: file.path, 
            id: file.filename, 
        }))

        next();
    });
};


export default cloudinaryMiddleware