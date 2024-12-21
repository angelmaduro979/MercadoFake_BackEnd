import mongoose from "mongoose";

const link_URL_ecommerce = "mongodb+srv://angelmaduro979:G9Zf5NBo47YUewT8@cluster0.euj5a.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

const connectionDB = mongoose.connect(link_URL_ecommerce, {})
  .then( () => {console.log('Conectado a la base de datos')})
  .catch((error) => {console.log('Error al conectar a la base de datos. El error es:'+ error)})
  .finally(() => {console.log('Intento de conexión finalizado.')});

export default connectionDB;
