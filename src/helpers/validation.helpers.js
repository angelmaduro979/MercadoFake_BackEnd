import ErrorValidateBuilder from "../builders/errorValidateBuilder.js";

//Existencia
const validateExistance = (field_name, field_value) => {
    if (!(field_value.trim() !== '')) {
        const error_code = 'EMPTY_FIELD_ERROR'
        const error_message = 'Attention! The field ' + field_name + ' cannot be empty!'
        const responseError = new ErrorValidateBuilder().setError_code(error_code).setError_message(error_message).setPath(field_name).build()
        return responseError
    } else {
        return null
    }
}
//RegExp

const validateRegExp = (field_name, field_value) => {



    const objetoRegexp = {
        name: {
            reg_exp: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
            error: "El nombre solo puede contener letras (con o sin acento) y espacios."
        },
        email: {
            reg_exp: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            error: "Por favor, ingresa un correo electrónico válido."
        },
        phone: {
            reg_exp: /^\d+$/,
            error: "El teléfono solo puede contener números."
        },
        password: {
            reg_exp: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\d\s!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/,
            error: "La contraseña solo puede contener letras (con o sin acento), números y algunos caracteres especiales."
        },
    }

    const field = objetoRegexp[field_name]

    if (!field) {
        const error_code = 'INVALID_FIELD'
        const error_message = 'El campo no es válido.'
        const responseError = new ErrorValidateBuilder().setError_code(error_code).setError_message(error_message).setPath(field_name).build()
        return responseError
    }

    if (!(field.reg_exp.test(field_value))) {
        const error_code = 'INVALID_EXPRESSION'
        const error_message = field.error
        const responseError = new ErrorValidateBuilder().setError_code(error_code).setPath(field_name).setError_message(error_message).build()
        return responseError
    } else {
        return null
    }
}

//Longitud

const validateLength = (field_name, field_value, length) => {
    if (field_value.length < length) {
        const error_code = 'INVALID_LENGTH'
        const error_message = 'The field ' + field_name + ', must have at least ' + length + ' characters'
        const responseError = new ErrorValidateBuilder().setError_code(error_code).setPath(field_name).setError_message(error_message).build()
        return responseError
    } else {
        return null
    }
}

export {
    validateExistance,
    validateRegExp,
    validateLength
}