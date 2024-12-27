import ResponseBuilder from "../builders/responseBuilder.js";
import { validateExistance, validateLength, validateRegExp } from "../helpers/validation.helpers.js";
import bcrypt from "bcrypt"
import User from "../models/user.model.js";
import emailSender from "../helpers/email_sender_helpers/emailSender.helpers.js";
import jwt from "jsonwebtoken"
import environment from "../config/environment.js";
import validator from "validator";


const authControllers = {};

//register controller
authControllers.registerPost = async (req, res) => {
    try {
        const { email, name, phone, password, role } = req.body;
      
        const campos_permitidos = {
            email: {
                valor: email,
                field_name: 'email',
                errors: [],
                validate: [
                    //RegExp
                    validateRegExp,
                    //Longitud
                    (field_name, field_value) => validateLength(field_name, field_value, 5),
                    //Existencia
                    validateExistance
                ]

            },
            name: {
                valor: name,
                field_name: 'name',
                errors: [],
                validate: [
                    //RegExp
                    validateRegExp,
                    //Longitud
                    (field_name, field_value) => validateLength(field_name, field_value, 3),
                    //Existencia
                    validateExistance
                ]

            },
            phone: {
                valor: phone,
                field_name: 'phone',
                errors: [],
                validate: [
                    //RegExp
                    validateRegExp,
                    //Longitud
                    (field_name, field_value) => validateLength(field_name, field_value, 10),
                    //Existencia
                    validateExistance
                ]

            },
            password: {
                valor: password,
                field_name: 'password',
                errors: [],
                validate: [
                    //RegExp
                    validateRegExp,
                    //Longitud
                    (field_name, field_value) => validateLength(field_name, field_value, 6),
                    //Existencia
                    validateExistance
                ]
            }
        }

        for (let field in campos_permitidos) {
            let hayErrores = false;
            for (let validationField of campos_permitidos[field].validate) {
                const result = validationField(campos_permitidos[field].field_name, campos_permitidos[field].valor)
                if (result) {
                    campos_permitidos[field].errors.push(result)
                    hayErrores = true
                    break; //para que no siga validando
                }
            }
            if (hayErrores) {
                const errorResponse = campos_permitidos[field].errors[0]
                const response = new ResponseBuilder().setOk(false).setStatus(400).setMessage('ERROR FOUND!').setError(errorResponse).build();
                return res.status(400).json(response)
            }
        }

        //---------------------------------------------------------------------------------------------------
        //Si no hay errores:

        campos_permitidos.email.valor=validator.escape(validator.normalizeEmail(validator.trim(campos_permitidos.email.valor)));
        campos_permitidos.name.valor=validator.escape(validator.trim(campos_permitidos.name.valor));
        campos_permitidos.phone.valor=validator.escape(validator.trim(campos_permitidos.phone.valor));
        campos_permitidos.password.valor=validator.escape(validator.trim(campos_permitidos.password.valor));
        //Hasheamos la password
        const hashed_password = await (bcrypt.hash(campos_permitidos.password.valor, 10))

        //Mandamos info a la base de datos. ➔  tenemos que configurar mongoose ➔ config .env ➔  environment ➔ models

        const userRegisteredInformation = {
            role: role,
            email: campos_permitidos.email.valor,
            name: campos_permitidos.name.valor,
            phone: campos_permitidos.phone.valor,
            password: hashed_password,
            verificationToken: ''
        }

        console.log('userRegisteredInformation', userRegisteredInformation)
        const userCreated = new User(userRegisteredInformation)

        await userCreated.save()

        //Creamos el Token y el link de verificacion
        const verificationToken = jwt.sign(
            {
                email: campos_permitidos.email.valor,
                phone: campos_permitidos.phone.valor
            },
            environment.key,
            {
                expiresIn: '1d'
            }
        )
        const linkVerify = `http://localhost:3000/api/authUser/verifyEmail/${verificationToken}`;


        //Mandamos el email de verificacion ➔ configuraramos el email transponder ➔ emailSender.helpers.js ➔ config .env ➔ environment 

        try {
            await emailSender(campos_permitidos.email.valor, '¡Confirma tu cuenta en MercadoLibre para comenzar a comprar y vender!', name, linkVerify, './src/helpers/email_sender_helpers/emailTemplate.html', './src/assets/images/imageEmail.png');
        } catch (error) {
            console.error('Error sending verification email', error);
            return res.status(500).json({ message: 'Error sending verification email', error });
        }


        const response = new ResponseBuilder().setOk(true).setStatus(200).setMessage('Success Register!').setData(campos_permitidos).build();
        return res.status(200).json(response)

    } catch (error) {
        console.error(error)
        let errorMessage = error.message || 'Ocurrió un error inesperado en el servidor.';
        const response = new ResponseBuilder().setStatus(500).setOk(false).setError('INTERNAL_SERVER_ERROR').setMessage(errorMessage).build()
        return res.status(500).json(response)
    }
}

//Controlador para verificar el email

authControllers.verifyEmail = async (req, res) => {
    try {
        const { url_token } = req.params;
        const token_payload = jwt.verify(url_token, environment.key)
        const token_email = token_payload.email;
        const find_User = await User.findOne({ email: token_email })
        if (!find_User) {
            const response = new ResponseBuilder().setOk(false).setError('USER_NOT_FOUND').build()
            return res.status(400).json(response)
        }
        
        find_User.emailVerified = true
        find_User.verificationToken = url_token
        await find_User.save()

        res.status(200).redirect('https://melifakecommerce.netlify.app/login')

    } catch (error) {
        console.error(error)
        res.sendStatus(500)
    }
}

authControllers.loginPost = async (req, res) => {
    try {
        const { email, phone, password } = req.body;
        
        const campos_permitidos = {
          
            email_o_phone: {
                valor: email || phone,
                field_name: email ? 'email' : 'phone',
                errors: [],
                validate: [
                    //RegExp
                    validateRegExp,
                    //Longitud
                    email
                        ? (field_name, field_value) => validateLength(field_name, field_value, 5)
                        : (field_name, field_value) => validateLength(field_name, field_value, 10),
                    //Existencia
                    validateExistance
                ]

            },

            password: {
                valor: password,
                field_name: 'password',
                errors: [],
                validate: [
                    //RegExp
                    validateRegExp,
                    //Longitud
                    (field_name, field_value) => validateLength(field_name, field_value, 6),
                    //Existencia
                    validateExistance
                ]
            }
        }

        for (let field in campos_permitidos) {
            let errorEncontrado = false;
            for (let validate of campos_permitidos[field].validate) {
                let errorLoginResult = validate(campos_permitidos[field].field_name, campos_permitidos[field].valor)
                if (errorLoginResult) {
                    campos_permitidos[field].errors.push(errorLoginResult)
                    errorEncontrado = true
                }
            }
            if (errorEncontrado) {
                let errorMessage = campos_permitidos[field].errors[0]
                const response = new ResponseBuilder().setStatus(400).setOk(false).setError('VALIDATION_ERROR').setMessage(errorMessage).build()
                return res.status(400).json(response)
            }
        }

        

        campos_permitidos.email_o_phone.valor=email
        ?validator.escape(validator.normalizeEmail(validator.trim(campos_permitidos.email_o_phone.valor)))//email
        :validator.escape(validator.trim(campos_permitidos.email_o_phone.valor))//Phone
        console.log("Email que se buscará:", validator.escape(validator.normalizeEmail(validator.trim(campos_permitidos.email_o_phone.valor))));

        campos_permitidos.password.valor=validator.escape(validator.trim(campos_permitidos.password.valor))
        const buscarUser = await User.findOne(email ? { email: campos_permitidos.email_o_phone.valor } : { phone: campos_permitidos.email_o_phone.valor })
        console.log(buscarUser)
        if (!buscarUser) {

            let errorMessage = email ? `¡El correo electrónico: ${email} no se encontró en la base de datos! Por favor, inténtalo de nuevo.` : `¡El teléfono: ${phone} no se encontró en la base de datos! Por favor, inténtalo de nuevo.`
            const response = new ResponseBuilder().setStatus(400).setOk(false).setError('USER_ERROR').setMessage(errorMessage).build()
            return res.status(400).json(response)
        }

        const passwordCheck = await (bcrypt.compare(campos_permitidos.password.valor, buscarUser.password))
        if (!passwordCheck) {
            let errorMessage = '¡La contraseña no es válida! Por favor, prueba otra.'
            const response = new ResponseBuilder().setStatus(400).setOk(false).setError('PASSWORD_ERROR').setMessage({error_message:  errorMessage}).build()
            return res.status(400).json(response)
        }

        if (!buscarUser.emailVerified) {
            let errorMessage = '¡Tu cuenta no ha sido verificada! Por favor, verifica tu correo.'
            const response = new ResponseBuilder().setStatus(400).setOk(false).setError('EMAIL_NOT_VERIFIED').setMessage({error_message:  errorMessage}).build()
            return res.status(400).json(response)
        }

        const accesToken = jwt.sign({
            id: buscarUser._id,
            name: buscarUser.name,
            email: buscarUser.email,
            phone: buscarUser.phone,
            role: buscarUser.role
        }, environment.key, {
            expiresIn: '1d'
        })
        
         req.session.accesToken = accesToken
         req.session.userId = buscarUser._id;
         req.session.name = buscarUser.name
         await req.session.save(err => {
             if (err) {
               console.error('Error al guardar la sesión:', err);
             } else {
               console.log('Sesión guardada con éxito:', req.session);
             }
           });
        
        const success_message = '¡Has iniciado sesión correctamente!'
        const frontEnd_Data = {
            userInformation: {
                name: buscarUser.name,
                phone: buscarUser.phone,
                email: buscarUser.email
            },
            userMessage: `¡Hola ${buscarUser.name}! ¡Bienvenido a tu cuenta!`,
            accesToken :accesToken

        };
        const response = new ResponseBuilder().setStatus(200).setOk(true).setMessage(success_message).setData(frontEnd_Data).build()
        return res.status(200).json(response)
        // })



    } catch (error) {
        console.error(error)
        let errorMessage = error.message || 'Ocurrió un error inesperado en el servidor.';
        const response = new ResponseBuilder().setStatus(500).setOk(false).setError('INTERNAL_SERVER_ERROR').setMessage({error_message:errorMessage}).build()
        return res.status(500).json(response)
    }
}


authControllers.deleteUserAccount = async (req, res) => {
    try {
        //Logica para eliminacion atraves de obtencion de id del backend con req.params
        
        const user_to_delete = await User.findOne({ _id: req.session.userId });
        if (!user_to_delete) {
            const errorMessage = `No se encontro un usuario para el id: ${userId}`;
            const error_response = new ResponseBuilder().setStatus(500).setOk(false).setError('USER_NOT_FOUND_ERROR').setMessage({error_message:errorMessage}).build()
            return res.status(404).json(error_response)
        }
        user_to_delete.activo = false;
        const success_message = '¡Usuario eliminado correctamente!'
        const success_response = new ResponseBuilder().setStatus(200).setOk(true).setMessage(success_message).build()
        return res.status(200).json(success_response)

    } catch (error) {
        console.error(error)
        let errorMessage = error.message || 'Ocurrió un error inesperado en el servidor.';
        const response = new ResponseBuilder().setStatus(500).setOk(false).setError('INTERNAL_SERVER_ERROR').setMessage({error_message:errorMessage}).build()
        return res.status(500).json(response)
    }
}

authControllers.logoutPost = async(req, res) => {
    try {
        console.log('user Id ', req.session.userId)
        console.log('access token ', req.session.accesToken)
        console.log('Session', req.session)
        req.session.destroy((error) => {
            if (error) {
                const logout_error = 'Hubo un error al cerrar sesión. Por favor, inténtalo de nuevo más tarde.'
                const response = new ResponseBuilder().setStatus(500).setOk(false).setError('LOGOUT_ERROR').setMessage({error_message:logout_error}).build()
                return res.status(500).json(response)
            }


            res.clearCookie('connect.sid');  // Para que se me elimine la cookie al salir de mi sesion

            const message_logout = 'Has cerrado sesión exitosamente. ¡Hasta pronto!';
            console.log(message_logout)
            const response = new ResponseBuilder().setStatus(200).setOk(true).setMessage(message_logout).build()
            return res.status(200).json(response)

        }

        )
    } catch (error) {
        console.error(error)
        let errorMessage = error.message || 'Ocurrió un error inesperado en el servidor.';
        const response = new ResponseBuilder().setStatus(500).setOk(false).setError('INTERNAL_SERVER_ERROR').setMessage({error_message:errorMessage}).build()
        return res.status(500).json(response)
    }
}

//Password Recovery

authControllers.passwordRecoveryPost = async (req, res) => {
    try {
        let { email } = req.body
        const errorDisplayed = []
        const errorValidates = [
            validateExistance,
            validateRegExp
        ]
        for (let validation of errorValidates) {
            let hayError = false
            const respuesta = validation('email', email)
            if (respuesta) {
                hayError = true;
                errorDisplayed.push(respuesta)
            }
            if (hayError) {
                const errorFound = errorDisplayed[0]
                const response = new ResponseBuilder().setStatus(400).setOk(false).setError('PASSWORD_RECOVERY_ERROR').setMessage({error_message:errorMessage}).build()
                return res.status(400).json(response)
            }
        }
        
        const validatedEmail = validator.trim(validator.escape(validator.normalizeEmail(email, { all_lowercase: true })))
        const search_user= await User.findOne({email: validatedEmail})
        if(!search_user){
            const errorMessage = 'El email ingresado no pertenece a ningun usuario registrado.'
            const response = new ResponseBuilder().setStatus(400).setOk(false).setError('PASSWORD_RECOVERY_ERROR').setMessage({error_message:errorMessage}).build()
            return res.status(400).json(response)
        }
        const payloadToken = {
            email:validatedEmail,
        }
        const token = jwt.sign(payloadToken, environment.key, { expiresIn: '1d' })
        const linkToken = `http://localhost:5173/Newpassword/${token}`
        try {
            await emailSender(email, '¡Restablece tu contraseña en MercadoLibre!', 'usuario', linkToken, './src/helpers/email_sender_helpers/forgotPasswordTemplate.html', './src/assets/images/imagenEmailPassword.png')
        } catch (error) {
            const errorEmail = error.message || error.code
            const response = new ResponseBuilder().setStatus(400).setOk(false).setError('PASSWORD_RECOVERY_ERROR').setMessage({error_message:errorEmail}).build()
            return res.status(400).json(response)
        }

        const message_emailSent = '¡Email enviado exitósamente!';
        const response = new ResponseBuilder().setStatus(200).setOk(true).setMessage(message_emailSent).setData([{ message: 'Success!' }]).build()
        return res.status(200).json(response)

    } catch (error) {
        console.error(error)
        let errorMessage = error.message || 'Ocurrió un error inesperado en el servidor.';
        const response = new ResponseBuilder().setStatus(500).setOk(false).setError('INTERNAL_SERVER_ERROR').setMessage({error_message:errorMessage}).build()
        return res.status(500).json(response)
    }
}

authControllers.tokenForgotPassword = async (req, res) => {
    try {
        const {reset_token} = req.params
        const {password} = req.body

        const token_verify_payload = jwt.verify(reset_token, environment.key)
        console.log('token_verify_payload', token_verify_payload)
        if(!token_verify_payload){
            const response = new ResponseBuilder().setStatus(400).setOk(false).setError('PASSWORD_RECOVERY_ERROR').setMessage({error_message:'Token invalido'}).build()
            return res.status(400).json(response)
        }
        const token_verify_payload_email = token_verify_payload.email
        console.log('token_verify_payload_email', token_verify_payload_email)
        const search_user= await User.findOne({email: token_verify_payload_email})
        if(!search_user){
            const response = new ResponseBuilder().setStatus(400).setOk(false).setError('USER_NOT_FOUND').setMessage({error_message:'usuario no encontrado'}).build()
            return res.status(400).json(response)
        }
        const passwordUser = search_user.password
        const comparePassword = bcrypt.compareSync(password, passwordUser)
        if(comparePassword){
            const response = new ResponseBuilder().setStatus(400).setOk(false).setError('PASSWORD_RECOVERY_ERROR').setMessage({error_message:'La contraseña ya estaba establecida'}).build()
            return res.status(400).json(response)
        }
        //cambiamos la contraseña
        const password_validation={
            password:{
                valor: password,
                field_name: 'password',
                errors: [],
                validate: [
                    //RegExp
                    validateRegExp,
                    //Longitud
                    (field_name, field_value) => validateLength(field_name, field_value, 8),
                    //Existencia
                    validateExistance
                ]
            }
        }
        for (let validation of password_validation.password.validate) {
            let hayError = false
            const respuesta = validation('password', password)
            if (respuesta) {
                hayError = true;
                password_validation.password.errors.push(respuesta)
            }
            if (hayError) {
                const errorFound = password_validation.password.errors[0]
                const response = new ResponseBuilder().setStatus(400).setOk(false).setError('PASSWORD_RECOVERY_ERROR').setMessage(errorFound).build()
                return res.status(400).json(response)
            }
        }
        password_validation.password.valor= validator.trim(password_validation.password.valor)
        const password_hash = bcrypt.hashSync(password_validation.password.valor, 10)
        search_user.password = password_hash
        await search_user.save()
        const response = new ResponseBuilder().setStatus(200).setOk(true).setMessage('PASSWORD_CHANGED').setData({ message: 'Success!' }).build()
        return res.status(200).json(response)
    } catch (error) {
        console.error(error)
        let errorMessage = error.message || 'Ocurrió un error inesperado en el servidor.';
        const response = new ResponseBuilder().setStatus(500).setOk(false).setError('INTERNAL_SERVER_ERROR').setMessage(errorMessage).build()
        return res.status(500).json(response)
    }
}

export default authControllers
