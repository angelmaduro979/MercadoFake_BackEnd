import jwt from 'jsonwebtoken'
import environment from '../config/environment.js'
import Sales from '../models/sales.model.js'
import Product from '../models/product.model.js'
import ResponseBuilder from '../builders/responseBuilder.js'
const salesController = {}


salesController.getSalesByUserId = async (req, res) => {
    try {
        const authorization = req.headers.authorization;

        if (!authorization) {
            const response = new ResponseBuilder()
                .setStatus(401)
                .setOk(false)
                .setError('UNAUTHORIZED')
                .setMessage({ error_message: 'No estás autorizado para realizar esta acción' })
                .build();
            return res.status(401).json(response);
        }

        const accessToken = authorization.split(' ')[1];
        const decodedToken = jwt.verify(accessToken, environment.key);
        const userId = decodedToken.id;

        if (!userId) {
            const response = new ResponseBuilder()
                .setStatus(401)
                .setOk(false)
                .setError('UNAUTHORIZED')
                .setMessage({ error_message: 'No estás autorizado para realizar esta acción' })
                .build();
            return res.status(401).json(response);
        }

        const productsSold = await Product.find({
            seller_id: userId,
            activo: true
        });

        if (!productsSold || productsSold.length === 0) {
            const response = new ResponseBuilder()
                .setStatus(400)
                .setOk(false)
                .setError('INVALID_REQUEST')
                .setMessage({ error_message: 'No se encontraron productos activos del vendedor' })
                .build();
            return res.status(400).json(response);
        }

        const productIds = productsSold.map(product => product._id);

        const sales = await Sales.find({
            sellerId: userId,
            productsSold: {
                $elemMatch: {
                    product: { $in: productIds }
                }
            }
        });

        const sold_product_to_send = [];
        const unsold_products = [];

        productsSold.forEach(product => {
            const salesQuantity = sales.reduce((acc, sale) => {
                sale.productsSold.forEach(productSold => {
                    if (productSold.product.toString() === product._id.toString()) {
                        acc += productSold.quantity;
                    }
                });
                return acc;
            }, 0);

            if (salesQuantity > 0) {
                sold_product_to_send.push({
                    _id: product._id,
                    product_name: product.product_name,
                    description: product.description,
                    price: product.price,
                    images: product.images[0]?.url,
                    category: product.category,
                    sales_quantity: salesQuantity
                });
            } else {
                unsold_products.push({
                    _id: product._id,
                    product_name: product.product_name,
                    description: product.description,
                    price: product.price,
                    images: product.images[0]?.url,
                    category: product.category,
                    sales_quantity: 0
                });
            }
        });


        const allProducts = [...sold_product_to_send, ...unsold_products];


        const success_message = 'Productos obtenidos correctamente!';
        const response = new ResponseBuilder()
            .setStatus(200)
            .setOk(true)
            .setMessage(success_message)
            .setData(allProducts)
            .build();

        return res.status(200).json(response);
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




export default salesController