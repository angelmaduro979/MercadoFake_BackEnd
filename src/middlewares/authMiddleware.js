import environment from "../config/environment.js"
import jwt from "jsonwebtoken"

const authMiddleware = (roles_permitidos) => {
 
    return (req, res, next) => {
        try {
            
            const auth_header = req.headers['authorization'] 

            if (!auth_header) {
                return res.status(401).json({ message: 'Falta el token de autorizacion' })
            }
         
            const access_token = auth_header.split(' ')[1]

            if (!access_token) {
                return res.status(401).json({ message: 'El token de autorizacion esta malformado' })
            }

            const user_session_payload_decoded = jwt.verify(access_token, environment.key)

            if(!roles_permitidos.includes(user_session_payload_decoded.role)){

                return res.status(401).json({ message: 'No tienes permisos para esa operacion' , status: 403})
            }

           

            
            req.user = user_session_payload_decoded
            console.log('user_session_payload_decoded', user_session_payload_decoded)
            next() 
            console.log('Después del next()')
        }
        catch (error) {
            console.error(error)
            res.sendStatus(500)
        }
    }
}


export default authMiddleware