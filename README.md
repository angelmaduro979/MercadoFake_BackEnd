# Backend del E-commerce "MercadoFake"

Este es el repositorio del backend para el proyecto de e-commerce "MercadoFake". Este backend permite gestionar usuarios, productos, autenticación, almacenamiento en la nube y más. Está construido utilizando tecnologías modernas y desplegado en un entorno de producción.

## Tecnologías utilizadas

Este backend se desarrolló utilizando las siguientes tecnologías:

- **Node.js**: Entorno de ejecución para JavaScript en el servidor.
- **Express**: Framework minimalista para la creación de servidores.
- **MongoDB**: Base de datos NoSQL para almacenar usuarios, productos y más.
- **Mongoose**: ODM para modelar datos y trabajar con MongoDB.
- **bcrypt**: Librería para el cifrado de contraseñas.
- **jsonwebtoken**: Implementación de autenticación mediante tokens JWT.
- **dotenv**: Gestión de variables de entorno.
- **cors**: Configuración de seguridad para permitir solicitudes desde el frontend.
- **express-session**: Manejo de sesiones en el servidor.
- **connect-mongo**: Almacenamiento de sesiones en MongoDB.
- **cloudinary**: Almacenamiento de imágenes en la nube.
- **multer**: Middleware para la carga de archivos.
- **multer-storage-cloudinary**: Adaptador de almacenamiento para Cloudinary.
- **nodemailer**: Envío de correos electrónicos.
- **qrcode**: Generación de códigos QR.
- **validator**: Validación y sanitización de datos.

## Características principales

- Registro y autenticación de usuarios con validación de correos electrónicos.
- Gestión de productos, incluyendo creación, edición y eliminación.
- Almacenamiento de imágenes en Cloudinary.
- Generación de códigos QR para funcionalidades específicas.
- Envío de correos electrónicos para notificaciones o validaciones.
- Sesiones de usuario seguras utilizando MongoDB como almacenamiento.

## Estructura del proyecto

```
backend/
├── src/
│   ├── config/          # Configuración de la base de datos y servicios externos
│   ├── controllers/     # Controladores de las rutas
│   ├── middleware/      # Middlewares personalizados
│   ├── models/          # Modelos de datos para MongoDB
│   ├── routes/          # Definición de rutas de la API
│   ├── utils/           # Utilidades y funciones comunes
│   └── server.js        # Punto de entrada del servidor
├── .env                 # Variables de entorno (no incluido en el repositorio)
├── package.json         # Dependencias y scripts
└── README.md            # Documentación del backend
```

## Endpoint del Backend Desplegado

El backend de este proyecto está desplegado y accesible públicamente en la siguiente URL:

**[https://mercadofake-backend.onrender.com](https://mercadofake-backend.onrender.com)**

Usa esta URL como base para interactuar con las rutas de la API. Por ejemplo:

- `POST /api/authUser/login` → Para iniciar sesión.
- `GET /api/products` → Para obtener todos los productos.

## Configuración inicial

1. Clona este repositorio:
   ```bash
   git clone https://github.com/tu-usuario/mercadofake-backend.git
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:
   ```env
   PORT=3000
   MONGO_URI=mongodb+srv://<usuario>:<contraseña>@cluster0.mongodb.net/ecommerce
   JWT_SECRET=tu_clave_secreta
   CLOUDINARY_CLOUD_NAME=tu_nombre_cloudinary
   CLOUDINARY_API_KEY=tu_api_key
   CLOUDINARY_API_SECRET=tu_api_secret
   EMAIL_USER=tu_correo@gmail.com
   EMAIL_PASS=tu_contraseña
   ```

4. Inicia el servidor en modo desarrollo:
   ```bash
   npm run dev
   ```

5. Accede al servidor en [http://localhost:3000](http://localhost:3000).

## Scripts disponibles

- `npm run dev`: Inicia el servidor en modo desarrollo utilizando `nodemon`.
- `npm start`: Inicia el servidor en modo producción.


¡Gracias por usar el backend de MercadoFake! Si tienes preguntas o problemas, no dudes en abrir un issue en el repositorio o contactarnos. 


