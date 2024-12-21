import mongoose from "mongoose";

const product_structure = {
    seller_id: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
    },
    product_name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    stock: {
        type: Number,
        required: true,
        min: 0,
    },
    addedToCart: {
        type: Boolean,
        default: false
    },
    category: {
        type: String,
        required: true,
        enum:[
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
          
    },
    images: [
        {
          url: { type: String, required: true },
          id: { type: String, required: true }
        }
      ],    

    activo: {
        type: Boolean,
        default: true
    }
}

const Schema_product= mongoose.Schema;
const productSchema=new Schema_product(product_structure, {timestamps: true});
const Products=mongoose.model('Products', productSchema)

export default Products;