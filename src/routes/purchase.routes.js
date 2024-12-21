import { Router } from "express";
import purchaseController from "../controllers/purchase.controller.js";
import authMiddleware from "../middlewares/authMiddleware.js"

const purchaseRoutes=Router()

//Purchase

purchaseRoutes.post('/createPurchase/:id', authMiddleware([ 'admin']), purchaseController.createPurchase)

//Show purchases by userId
purchaseRoutes.get('/mostrarPurchasesByUserId',authMiddleware([ 'admin']), purchaseController.mostrarPurchasesByUserId)

//Show purchase details

purchaseRoutes.get('/mostrarPurchaseDetails/:id', authMiddleware(['admin']), (req, res, next) => {
    console.log('test')
    console.log('Ruta params:', req.params);
    console.log('test')
    next();},purchaseController.mostrarPurchaseDetails)

export default purchaseRoutes