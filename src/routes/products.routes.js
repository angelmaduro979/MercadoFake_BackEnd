import { Router } from "express";
import productsControllers from "../controllers/products.controllers.js";
import cloudinaryMiddleware from "../middlewares/uploadMiddleware.js";
import authMiddleware from "../middlewares/authMiddleware.js"

import mergeBodyAndFiles from "../middlewares/mergeBodyAndFiles.js"
const productRoutes=Router();

//Agregar Productos
productRoutes.post('/addProduct',authMiddleware([ 'admin']), cloudinaryMiddleware, mergeBodyAndFiles, productsControllers.agregarProductosPost)

//Mostrar Productos

productRoutes.get('/mostrarProductos', productsControllers.mostrarProductosGet)

//Mostrar detalles de Productos

productRoutes.get('/mostrarProductosById/:productId', productsControllers.mostrarProductosById)

//Mostrar Productos buscados
productRoutes.post('/search', productsControllers.mostrarProductosBuscados)

//Mostrar Productos por categoria

productRoutes.get('/mostrarProductosByCategory/:categoryName', productsControllers.mostrarProductosByCategory)

//Eliminar Productos

productRoutes.put('/deleteProductosByUserId',authMiddleware(['admin']) ,productsControllers.deleteProductosByUserId)

//Actualizar Productos

productRoutes.put('/updateProductosByUserId/:productId',authMiddleware(['admin']), cloudinaryMiddleware, mergeBodyAndFiles, productsControllers.modificarProductos)

export default productRoutes;