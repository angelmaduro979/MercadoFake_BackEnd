import mongoose from "mongoose";

const link_URL_ecommerce = "mongodb://localhost:27017/ecommerce"

const connectionDB = mongoose.connect(link_URL_ecommerce, {})
  .then( () => {console.log('Conectado a la base de datos')})
  .catch((error) => {console.log('Error al conectar a la base de datos. El error es:'+ error)})
  .finally(() => {console.log('Intento de conexión finalizado.')});

export default connectionDB;
