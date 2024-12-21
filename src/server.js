import express from "express";
import authRoutes from "./routes/auth.routes.js";
import purchaseRoutes from "./routes/purchase.routes.js";
import productRoutes from "./routes/products.routes.js";
import salesRoutes from "./routes/sales.routes.js";
import connectionDB from "./config/db.config.js";
import session from "express-session";
import environment from "./config/environment.js";
import cors from "cors";


connectionDB

const app= express();
const PORT=3000


//--------Middlewares--------------
app.use(express.json())

 app.use(session({
     secret: environment.session_secret, 
     saveUninitialized: false,
     resave: false,
     cookie: {
         httpOnly: true,
         secure: false,
         maxAge: 1000 * 60 * 60 * 24, 
       }
 }))
app.use(cors({
    origin:['http://localhost:5173', 'https://mercadofake.netlify.app'],
    credentials: true,
    methods:['GET', 'PUT', 'POST', 'DELETE'],
    allowedHeaders:['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200
}))
//---------Endpoints---------------
//Auth Users
app.use('/api/authUser', authRoutes)

//Products 
app.use('/api/products', productRoutes)

//Purchases
app.use('/api/purchases', purchaseRoutes)

//Sales
app.use('/api/sales', salesRoutes)

//---------Server----------------
app.listen(PORT,()=>{
    console.log('The server is working on http://localhost:'+PORT)
})
