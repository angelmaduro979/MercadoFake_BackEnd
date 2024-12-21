import { Router } from "express";
import authControllers from "../controllers/auth.controllers.js";

const authRoutes=Router()

//Ruta de prueba
// authRoutes.post('/test',authControllers.test)✅ 
//---------------------------------------------------
//register route

authRoutes.post('/register',authControllers.registerPost)

//Verification Route
authRoutes.get('/verifyEmail/:url_token', authControllers.verifyEmail)

//Login Route
authRoutes.post('/login', authControllers.loginPost)

//Logout Route
authRoutes.post('/logout',authControllers.logoutPost)

//Delete User/ Active: True ➔ Active: False 
authRoutes.put ('/deleteUser',authControllers.deleteUserAccount)

//Password Recovery
authRoutes.post('/passwordRecovery', authControllers.passwordRecoveryPost)
authRoutes.put("/tokenForgotPassword/:reset_token", authControllers.tokenForgotPassword)

export default authRoutes;
