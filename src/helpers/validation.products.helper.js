import ErrorValidateBuilder from "../builders/errorValidateBuilder.js";


//Existencia
const validateProductExistance = (field_name, field_value) => {
    if (!field_value) {
        const error_code = 'EMPTY_FIELD_ERROR'
        const error_message = 'Attention! The field ' + field_name + ' cannot be empty!'
        const responseError = new ErrorValidateBuilder().setError_code(error_code).setError_message(error_message).setPath(field_name).build()
        return responseError
    } else {
        return null
    }
}

//Tipo de archivo



const validateImageSize = (field_name, images, maxSizeAllowed) => {
   
    const maxSize = maxSizeAllowed * 1024 * 1024
    const unsupportedSize = images.filter(image => image.size > maxSize)
    if (unsupportedSize.length > 0) {
        const error_code = 'IMG_SIZE_ERROR'
        const error_message = '¡La imagen ingresada en el campo' + field_name + ' no debe pesar mas de ' + maxSizeAllowed + 'MB!'
        const responseError = new ErrorValidateBuilder().setError_code(error_code).setError_message(error_message).setPath(field_name).build()
        return responseError
    } else {
        return null
    }
}

const validateImageCount = (field_name, images, maxCountAllowed) => {
    if (images.length > maxCountAllowed) {
        const error_code = 'IMG_COUNT_ERROR'
        const error_message = '¡En el campo' + field_name + ' solo pueden haber ' + maxCountAllowed + ' imagenes!'
        const responseError = new ErrorValidateBuilder().setError_code(error_code).setError_message(error_message).setPath(field_name).build()
        return responseError
    } else {
        return null
    }
}



//Longitud

const validateLengthProducts = (field_name, field_value, length) => {
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
    validateProductExistance,
    validateLengthProducts,
    validateImageSize,
    validateImageCount
}