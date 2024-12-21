import ResponseBuilder from "../builders/responseBuilder.js";
import { validateProductExistance, validateImageSize, validateLengthProducts, validateImageCount } from "../helpers/validation.products.helper.js"
import User from "../models/user.model.js";
import Products from "../models/product.model.js";
import emailSender from "../helpers/email_sender_helpers/emailSender.helpers.js";
import jwt from "jsonwebtoken"
import environment from "../config/environment.js";
import validator from 'validator';
import mongoose from "mongoose";



const productsControllers = {}

//Agregar Productos
productsControllers.agregarProductosPost = async (req, res) => {
    try {
        const authorization = req.headers.authorization
        if(!authorization){
            const response= new ResponseBuilder().setStatus(401).setOk(false).setError('UNAUTHORIZED').setMessage({error_message:'No estas autorizado para realizar esta accion'}).build()
            return res.status(401).json(response)
        }
        const accesToken = authorization.split(' ')[1]
        const decodedToken = jwt.verify(accesToken, environment.key)
        console.log(decodedToken)

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'Debes subir al menos una imagen.' });
        }

        const { product_name, description, price, stock, category, uploadedImages } = req.body;

        if (!uploadedImages || uploadedImages.length === 0 || !Array.isArray(uploadedImages)) {
            const response = new ResponseBuilder().setStatus(401).setOk(false).setError('IMAGE_URL_ERROR').setMessage('Debes subir al menos una imagen con URL válida.').build()
            return res.status(401).json(response);
        }

        const filesUploaded = req.files
        console.log('Imágenes recibidas:', req.files);
        if (!req.files || req.files.length === 0) {
            const response = new ResponseBuilder().setStatus(401).setOk(false).setError('IMAGE_ERROR').setMessage('Debes subir al menos una imagen.').build()
            return res.status(401).json(response);
        }

        const campos_permitidos_productos = {
            product_name: {
                valor: product_name,
                field_name: "Nombre del Producto",
                errors: [],
                validate: [
                    validateProductExistance,
                    (field_name, field_value) => validateLengthProducts(field_name, field_value, 10),

                ]
            },
            description: {
                valor: description,
                field_name: "Descripcion del Producto",
                errors: [],
                validate: [
                    validateProductExistance,
                    (field_name, field_value) => validateLengthProducts(field_name, field_value, 20),

                ]
            },
            price: {
                valor: price,
                field_name: "Precio del Producto",
                errors: [],
                validate: [
                    validateProductExistance
                ]
            },
            stock: {
                valor: stock,
                field_name: "Stock del Producto",
                errors: [],
                validate: [
                    validateProductExistance

                ]
            },
            category: {
                valor: category,
                field_name: "Categoria del Producto",
                errors: [],
                validate: [
                    validateProductExistance
                ]
            },
            image: {
                valor: filesUploaded,
                field_name: "Imagen del Producto",
                errors: [],
                validate: [

                    (field_name, images) => validateImageSize(field_name, images, 5),
                    (field_name, images) => validateImageCount(field_name, images, 3),

                ]

            }
        }

        for (const field in campos_permitidos_productos) {
            let hayErrores = false;
            for (const validate of campos_permitidos_productos[field].validate) {
                const respuestaError = validate(campos_permitidos_productos[field].field_name, campos_permitidos_productos[field].valor)
                if (respuestaError) {
                    hayErrores = true;
                    campos_permitidos_productos[field].errors.push(respuestaError)
                }
            }
            if (hayErrores) {
                const errorMessage = campos_permitidos_productos[field].errors[0]
                const response = new ResponseBuilder().setStatus(400).setOk(false).setError('PRODUCT_ERROR').setMessage(errorMessage).build()
                return res.status(400).json(response)
            }
        }


        // Sanitización para name y description
        campos_permitidos_productos.product_name.valor = validator.trim(campos_permitidos_productos.product_name.valor);
        campos_permitidos_productos.description.valor = validator.trim(campos_permitidos_productos.description.valor);


        // Sanitización para price y stock
        campos_permitidos_productos.price.valor = Number(validator.trim(campos_permitidos_productos.price.valor));
        campos_permitidos_productos.stock.valor = Number(validator.trim(campos_permitidos_productos.stock.valor));

        // Sanitización para categorías
      
        const categoriasPermitidas = [
            "",
            "Electrónica, Audio y Video",
            "Hogar, Muebles y Jardín",
            "Ropa, Zapatos y Accesorios",
            "Deportes y Fitness",
            "Bebés",
            "Salud y Belleza",
            "Juguetes y Hobbies",
            "Automóviles, Motos y Otros Vehículos",
            "Libros, Revistas y Comics",
            "Alimentos y Bebidas",
            "Servicios",
            "Inmuebles",
            "Mascotas",
            "Industria y Oficinas",
            "Arte y Antigüedades"
        ]
        if (!categoriasPermitidas.includes(campos_permitidos_productos.category.valor)) {
            const response = new ResponseBuilder().setStatus(400).setOk(false).setError('CATEGORY_ERROR').setMessage({error_message:'La categoría no es permitida.'}).build()
            return res.status(400).json(response)
        }

        if (isNaN(campos_permitidos_productos.stock.valor)) {
            const response = new ResponseBuilder().setStatus(400).setOk(false).setError('STOCK_ERROR').setMessage({error_message:'El stock debe ser un valor numérico.'}).build()
            return res.status(400).json(response)
        }

   

        const products = new Products({

            seller_id: decodedToken.id,
            product_name: campos_permitidos_productos.product_name.valor,
            description: campos_permitidos_productos.description.valor,
            price: campos_permitidos_productos.price.valor,
            stock: campos_permitidos_productos.stock.valor,
            category: campos_permitidos_productos.category.valor,
            images: uploadedImages

        });
        await products.save()
        req.session.product_id = products._id
        await req.session.save(err => {
            if (err) {
                console.error('Error al guardar la sesión:', err);
            } else {
                console.log('Sesión guardada con éxito:', req.session);
            }
        });
     
        
        const success_message = 'Producto agregado correctamente!'
        const success_response = new ResponseBuilder().setStatus(200).setOk(true).setMessage(success_message).setData({ productos: products, id_Producto: req.session.product_id }).build()
        return res.status(200).json(success_response)
    } catch (error) {
        console.error(error)
        let errorMessage = error.message || 'Ocurrió un error inesperado en el servidor.';
        const response = new ResponseBuilder().setStatus(500).setOk(false).setError('INTERNAL_SERVER_ERROR').setMessage(errorMessage).build()
        return res.status(500).json(response)
    }
}
//Mostrar Productos

productsControllers.mostrarProductosGet = async (req, res) => {
    try {
        
        const products = await Products.find({ activo: true });
        if (!products) {
            let errorMessage = '¡No se encontraron productos!'
            const response = new ResponseBuilder().setStatus(400).setOk(false).setError('AVAILABILITY_ERROR').setMessage(errorMessage).build()
            return res.status(400).json(response)
        }
        const success_message = 'Productos OBTENIDOS correctamente!'
        const validProducts = products.filter(product => product !== null && product !== undefined);
        const success_response = new ResponseBuilder().setStatus(200).setOk(true).setMessage(success_message).setData({ products: validProducts }).build()
        return res.status(200).json(success_response)
    } catch (error) {
        console.error(error)
        let errorMessage = error.message || 'Ocurrió un error inesperado en el servidor.';
        const response = new ResponseBuilder().setStatus(500).setOk(false).setError('INTERNAL_SERVER_ERROR').setMessage(errorMessage).build()
        return res.status(500).json(response)
    }
}

//Mostrar detalles de Productos

productsControllers.mostrarProductosById = async (req, res) => {
    try {
        const { productId } = req.params
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            let errorMessage = 'El ID del producto no es válido.';
            const response = new ResponseBuilder()
                .setStatus(400)
                .setOk(false)
                .setError('INVALID_ID')
                .setMessage(errorMessage)
                .build();
            return res.status(400).json(response);
        }
        const product = await Products.findOne({ activo: true } && { _id: productId });
        if (!product) {
            let errorMessage = '¡No se encontraron productos!'
            const response = new ResponseBuilder().setStatus(400).setOk(false).setError('AVAILABILITY_ERROR').setMessage({error_message:errorMessage}).build()
            return res.status(400).json(response)
        }
        console.log('Producto:', product)
        const success_message = 'Productos OBTENIDOS correctamente!'
        const success_response = new ResponseBuilder().setStatus(200).setOk(true).setMessage(success_message).setData(product).build()
        return res.status(200).json(success_response)
    } catch (error) {
        console.error(error)
        let errorMessage = error.message || 'Ocurrió un error inesperado en el servidor.';
        const response = new ResponseBuilder().setStatus(500).setOk(false).setError('INTERNAL_SERVER_ERROR').setMessage({error_message:errorMessage}).build()
        return res.status(500).json(response)
    }
}

productsControllers.mostrarProductosBuscados = async (req, res) => {
    console.log('user Id ', req.session.userId)
    console.log('access token ', req.session.accesToken)
    console.log('Session', req.session)
    try {
        const { searchTerm } = req.body
        console.log('Search Term:', searchTerm)
        if (!searchTerm || searchTerm.trim() === '') {
            let errorMessage = '¡No hay termino buscado!'
            const response = new ResponseBuilder().setStatus(400).setOk(false).setError('SEARCH_ERROR').setMessage({ error_message: errorMessage }).build()
            return res.status(400).json(response)
        }
        const products = await Products.find({ activo: true, product_name: { $regex: searchTerm, $options: "i" } });
        if (products.length === 0) {
            let errorMessage = '¡No se encontraron productos!'
            const response = new ResponseBuilder().setStatus(400).setOk(false).setError('AVAILABILITY_ERROR').setMessage({ error_message: errorMessage }).build()
            return res.status(400).json(response)
        }
        console.log('Productos encontrados:', products)
        const success_message = 'Productos OBTENIDOS correctamente!'
        const success_response = new ResponseBuilder().setStatus(200).setOk(true).setMessage(success_message).setData({ products: products }).build()
        return res.status(200).json(success_response)
    } catch (error) {
        console.error(error)
        let errorMessage = error.message || 'Ocurrió un error inesperado en el servidor.';
        const response = new ResponseBuilder().setStatus(500).setOk(false).setError('INTERNAL_SERVER_ERROR').setMessage({ error_message: errorMessage }).build()
        return res.status(500).json(response)
    }
}

productsControllers.mostrarProductosByCategory = async (req, res) => {
    try {

        const { categoryName } = req.params
        const decodedCategory = decodeURIComponent(categoryName.replace(/-/g, " "));
        console.log('Categoria del producto:', decodedCategory)
        const products = await Products.find({
            activo: true,
            category: { $regex: decodedCategory, $options: "i" }
        });


        if (!products) {
            let errorMessage = '¡No se encontraron productos!'
            const response = new ResponseBuilder().setStatus(400).setOk(false).setError('AVAILABILITY_ERROR').setMessage({ error_message: errorMessage }).build()
            return res.status(400).json(response)
        }
        const success_message = 'Productos OBTENIDOS correctamente!'
        const success_response = new ResponseBuilder().setStatus(200).setOk(true).setMessage(success_message).setData(products).build()
        return res.status(200).json(success_response)

    } catch (error) {
        console.error(error)
        let errorMessage = error.message || 'Ocurrió un error inesperado en el servidor.';
        const response = new ResponseBuilder().setStatus(500).setOk(false).setError('INTERNAL_SERVER_ERROR').setMessage(errorMessage).build()
        return res.status(500).json(response)
    }
}

//----------Solo para los que publican los Productos. Por ejemplo: Los clientes no pueden hacer esto

//Mostrar Productos Que monto el usuario

//Eliminar Productos
productsControllers.deleteProductosByUserId = async (req, res) => {
    try {
        console.log('test')
        const { productId } = req.body
        console.log('user Id de deleteProducts ', productId)
        const productToDelete = await Products.findOne({ activo: true } && { _id:productId });
        if (!productToDelete) {
            let errorMessage = '¡Todavía no tienes productos publicados!'
            const response = new ResponseBuilder().setStatus(400).setOk(false).setError('AVAILABILITY_ERROR').setMessage({error_message:errorMessage}).build()
            return res.status(400).json(response)
        }
        productToDelete.activo = false
        await productToDelete.save()
        const success_message = 'Producto eliminado correctamente!'
        const success_response = new ResponseBuilder().setStatus(200).setOk(true).setMessage(success_message).setData(productToDelete).build()
        return res.status(200).json(success_response)
    } catch (error) {
        console.error(error)
        let errorMessage = error.message || 'Ocurrió un error inesperado en el servidor.';
        const response = new ResponseBuilder().setStatus(500).setOk(false).setError('INTERNAL_SERVER_ERROR').setMessage({error_message:errorMessage}).build()
        return res.status(500).json(response)
    }
}
//Editar Producto

productsControllers.modificarProductos = async (req, res) => {
    try {
        const { productId } = req.params
        console.log('user Id: ', productId)
        const { product_name, description, price, stock, category } = req.body;
        const filesUploaded = req.files
        const campos_permitidos_productos = {
            product_name: {
                valor: product_name,
                field_name: "Nombre del Producto",
                errors: [],
                validate: [
                    validateProductExistance,
                    (field_name, field_value) => validateLengthProducts(field_name, field_value, 10),

                ]
            },
            description: {
                valor: description,
                field_name: "Descripcion del Producto",
                errors: [],
                validate: [
                    validateProductExistance,
                    (field_name, field_value) => validateLengthProducts(field_name, field_value, 20),

                ]
            },
            price: {
                valor: price,
                field_name: "Precio del Producto",
                errors: [],
                validate: [
                    validateProductExistance,

                ]
            },
            stock: {
                valor: stock,
                field_name: "Stock del Producto",
                errors: [],
                validate: [
                    validateProductExistance,
                    
                ]
            },
            category: {
                valor: category,
                field_name: "Categoria del Producto",
                errors: [],
                validate: [
                    validateProductExistance
                ]
            },
            image: {
                valor: filesUploaded,
                field_name: "Imagen del Producto",
                errors: [],
                validate: [
                    
                    (field_name, images) => validateImageSize(field_name, images, 5),
                    (field_name, images) => validateImageCount(field_name, images, 3),
                    validateProductExistance
                ]

            }
        }

        for (const field in campos_permitidos_productos) {
            let hayErrores = false;
            for (const validate of campos_permitidos_productos[field].validate) {
                const respuestaError = validate(campos_permitidos_productos[field].field_name, campos_permitidos_productos[field].valor)
                if (respuestaError) {
                    hayErrores = true;
                    campos_permitidos_productos[field].errors.push(respuestaError)
                }
            }
            if (hayErrores) {
                const errorMessage = campos_permitidos_productos[field].errors[0]
                const response = new ResponseBuilder().setStatus(400).setOk(false).setError('PRODUCT_ERROR').setMessage({error_message:errorMessage}).build()
                return res.status(400).json(response)
            }
        }
        
        campos_permitidos_productos.product_name.valor = validator.escape(validator.trim(campos_permitidos_productos.product_name.valor));
        campos_permitidos_productos.description.valor = validator.escape(validator.trim(campos_permitidos_productos.description.valor));

        campos_permitidos_productos.price.valor = Number(validator.trim(campos_permitidos_productos.price.valor));
        campos_permitidos_productos.stock.valor = Number(validator.trim(campos_permitidos_productos.stock.valor));

        campos_permitidos_productos.category.valor = validator.escape(validator.trim(campos_permitidos_productos.category.valor));

        const existingProduct = await Products.findOne({ activo: true } && { _id: productId });
        if (!existingProduct) {
            let errorMessage = '¡Productos no encontrados!'
            const response = new ResponseBuilder().setStatus(400).setOk(false).setError('AVAILABILITY_ERROR').setMessage({error_message:errorMessage}).build()
            return res.status(400).json(response)
        }
        const updatedImages = filesUploaded?.map(file => ({
            url: file.path,
            id: file.filename
        })) || existingProduct.images;

        const updatedProduct = await Products.findByIdAndUpdate(
            {_id: productId, },
            {
                product_name: campos_permitidos_productos.product_name.valor,
                description: campos_permitidos_productos.description.valor,
                price: campos_permitidos_productos.price.valor,
                stock: campos_permitidos_productos.stock.valor,
                category: campos_permitidos_productos.category.valor,
                images: updatedImages
            },
            { new: true, runValidators: true }
        );
        await updatedProduct.save();

        const success_message = 'Producto Editado correctamente!'
        const success_response = new ResponseBuilder().setStatus(200).setOk(true).setMessage(success_message).setData(updatedProduct).build()
        return res.status(200).json(success_response)

    } catch (error) {
        console.error(error)
        let errorMessage = error.message || 'Ocurrió un error inesperado en el servidor.';
        const response = new ResponseBuilder().setStatus(500).setOk(false).setError('INTERNAL_SERVER_ERROR').setMessage(errorMessage).build()
        return res.status(500).json(response)
    }
}

export default productsControllers;