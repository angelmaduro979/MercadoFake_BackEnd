import Product from "../models/product.model.js";
import Purchase from "../models/purchase.model.js";
import Sales from "../models/sales.model.js";
import ResponseBuilder from "../builders/responseBuilder.js";
import { validateExistance, validateLength, validateRegExp } from "../helpers/validation.helpers.js";
import bcrypt from "bcrypt"
import User from "../models/user.model.js";
import emailSender from "../helpers/email_sender_helpers/emailSender.helpers.js";
import jwt from "jsonwebtoken"
import environment from "../config/environment.js";
import validator from "validator";


const purchaseController = {};


purchaseController.createPurchase = async (req, res) => {
    try {
        const authorization = req.headers.authorization
        console.log(authorization)
        if (!authorization) {
            const response = new ResponseBuilder().setStatus(401).setOk(false).setError('UNAUTHORIZED').setMessage({ error_message: 'No estas autorizado para realizar esta accion' }).build()
            return res.status(401).json(response)
        }
        const accesToken = authorization.split(' ')[1]
        const decodedToken = jwt.verify(accesToken, environment.key)
        console.log(decodedToken)

        const product_id = req.params.id
        if (!product_id) {
            const response = new ResponseBuilder().setStatus(400).setOk(false).setError('INVALID_REQUEST').setMessage({ error_message: 'No se ha enviado el ID del producto' }).build()
            return res.status(400).json(response)
        }
        const productPurchased = await Product.findById(product_id)
        if (!productPurchased) {
            const response = new ResponseBuilder().setStatus(400).setOk(false).setError('INVALID_REQUEST').setMessage({ error_message: 'No se ha encontrado el producto' }).build()
            return res.status(400).json(response)
        }
        console.log(product_id)
        console.log(req.body.purchaseAmount)
        const { purchaseAmount } = req.body
        if (!purchaseAmount) {
            const response = new ResponseBuilder().setStatus(400).setOk(false).setError('INVALID_REQUEST').setMessage({ error_message: 'No se ha enviado la compra' }).build()
            return res.status(400).json(response)
        }
        console.log(purchaseAmount)
        const totalAmount = productPurchased.price * purchaseAmount.units_requested
        const createdPurchase = new Purchase({
            sellerId: productPurchased.seller_id,
            buyer: decodedToken.id,
            productsPurchased: [
                {
                    product: productPurchased._id,  // ID del producto comprado
                    quantity: purchaseAmount.units_requested  // Cantidad de productos comprados
                }
            ],
            totalAmount: totalAmount,
            paymentMethod: purchaseAmount.payment_method,
            paymentStatus: purchaseAmount.payment_status,
        })
        await createdPurchase.save()
        if (!createdPurchase) {
            const response = new ResponseBuilder().setStatus(400).setOk(false).setError('INVALID_REQUEST').setMessage({ error_message: 'No se ha podido crear la compra' }).build()
            return res.status(400).json(response)
        }
        //Logica para el vendedor
        const seller = await User.findOne({ _id: productPurchased.seller_id })
        if (!seller) {
            const response = new ResponseBuilder().setStatus(400).setOk(false).setError('INVALID_REQUEST').setMessage({ error_message: 'No se ha encontrado el vendedor' }).build()
            return res.status(400).json(response)
        }
        seller.productsSold = [{ product: productPurchased._id, quantity: purchaseAmount.units_requested }]

        await seller.save()

        //Logica para el comprador
        const buyer = await User.findOne({ name: decodedToken.name })
        if (!buyer) {
            const response = new ResponseBuilder().setStatus(400).setOk(false).setError('INVALID_REQUEST').setMessage({ error_message: 'No se ha encontrado el comprador' }).build()
            return res.status(400).json(response)
        }
        buyer.productsBought = [{ product: productPurchased._id, quantity: purchaseAmount.units_requested }]
        await buyer.save()

        //Logica para registrar la venta

        const createdSale = new Sales({
            sellerId: productPurchased.seller_id,
            customer: decodedToken.id,
            productsSold: [
                {
                    product: productPurchased._id,  
                    quantity: purchaseAmount.units_requested  
                }
            ],
            purchase: createdPurchase._id,
            purchaseStatus: purchaseAmount.payment_status,
            totalAmount: totalAmount
        })
        await createdSale.save()
        if (!createdSale) {
            const response = new ResponseBuilder().setStatus(400).setOk(false).setError('INVALID_REQUEST').setMessage({ error_message: 'No se ha podido registrar la venta' }).build()
            return res.status(400).json(response)
        }
        const response = new ResponseBuilder().setStatus(200).setOk(true).setMessage('Compra realizada con exito').setData({ nuevaCompra: createdPurchase, productoComprado: productPurchased }).build()
        res.status(200).json(response)
    } catch (error) {
        console.error(error)
        let errorMessage = error.message || 'Ocurrio un error inesperado en el servidor.';
        const response = new ResponseBuilder().setStatus(500).setOk(false).setError('INTERNAL_SERVER_ERROR').setMessage({ error_message: errorMessage }).build()
        return res.status(500).json(response)
    }
}

purchaseController.mostrarPurchasesByUserId = async (req, res) => {
    try {
        
        const accessTokenHeader = req.headers.authorization;
        if (!accessTokenHeader) {
            const errorMessage = '¡No se encontraron productos!';
            const response = new ResponseBuilder()
                .setStatus(400)
                .setOk(false)
                .setError('AVAILABILITY_ERROR')
                .setMessage({ error_message: errorMessage })
                .build();
            return res.status(400).json(response);
        }

        

       
        const accessToken = accessTokenHeader.split(' ')[1];
        const decodedToken = jwt.verify(accessToken, environment.key);
        const userId = decodedToken.id;

       
        const purchases = await Purchase.find({ buyer: userId });
        
        if (!purchases || purchases.length === 0) {
            const errorMessage = '¡No se encontraron productos!';
            const response = new ResponseBuilder()
                .setStatus(404)
                .setOk(false)
                .setError('NO_PURCHASES_FOUND')
                .setMessage({ error_message: errorMessage })
                .build();
            return res.status(404).json(response);
        }

       
        const productIds = [];
        purchases.forEach(purchase => {
            purchase.productsPurchased.forEach(item => {
                productIds.push(item.product); 
            });
        });
        
       
        const productsData = await Product.find({ _id: { $in: productIds } });

        
        const products = [];
        purchases.forEach(purchase => {
            purchase.productsPurchased.forEach(item => {
                const product = productsData.find(p => p._id.equals(item.product));
                if (product) {
                    products.push({
                        _id: product._id,
                        date: purchase.createdAt, 
                        name: product.product_name,
                        description: product.description,
                        price: product.price,
                        image: product.images[0]    ,
                        units: item.quantity
                    });
                }
            });
        });
        

        const successMessage = 'Productos obtenidos correctamente.';
        const successResponse = new ResponseBuilder()
            .setStatus(200)
            .setOk(true)
            .setMessage(successMessage)
            .setData({ products })
            .build();

        return res.status(200).json(successResponse);

    } catch (error) {
        console.error(error);
        const errorMessage = error.message || 'Ocurrió un error inesperado en el servidor.';
        const response = new ResponseBuilder()
            .setStatus(500)
            .setOk(false)
            .setError('INTERNAL_SERVER_ERROR')
            .setMessage({ error_message: errorMessage })
            .build();
        return res.status(500).json(response);
    }
};

purchaseController.mostrarPurchaseDetails = async (req, res) => {
    try{
        const { id } = req.params
        console.log('id', id)
        const productDetails = await Product.findOne({ activo: true } && { _id: id });
        if (!productDetails) {
            let errorMessage = '¡No se encontraron productos!';
            const response = new ResponseBuilder().setStatus(400).setOk(false).setError('AVAILABILITY_ERROR').setMessage({error_message:errorMessage}).build()
            return res.status(400).json(response)
        }
        console.log('productDetails', productDetails)
        
        const product_details_to_send = {
            _id: productDetails._id,
            name: productDetails.product_name,
            description: productDetails.description,
            price: productDetails.price,
            image: productDetails.images[0].url,
            date: new Date()
        }
        const success_message = 'Productos OBTENIDOS correctamente!';
        const success_response = new ResponseBuilder().setStatus(200).setOk(true).setMessage(success_message).setData({ product: [product_details_to_send] }).build()
        return res.status(200).json(success_response)
    }catch(error){
        console.error(error);
        const errorMessage = error.message || 'Ocurrió un error inesperado en el servidor.';
        const response = new ResponseBuilder()
            .setStatus(500)
            .setOk(false)
            .setError('INTERNAL_SERVER_ERROR')
            .setMessage({ error_message: errorMessage })
            .build();
        return res.status(500).json(response); 
    }
}

export default purchaseController