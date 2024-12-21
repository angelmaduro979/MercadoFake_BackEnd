import { Router} from "express";
import salesController from "../controllers/seller.controller.js";
import authMiddleware from "../middlewares/authMiddleware.js"

const salesRoutes=Router();

salesRoutes.get('/mostrarProductosVendidosByUserId',authMiddleware([ 'admin']), salesController.getSalesByUserId)

export default salesRoutes