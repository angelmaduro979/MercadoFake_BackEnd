const mergeBodyAndFiles = (req, res, next) => {
    const fields = req.body; 
    const files = req.files; 
    console.log('Cuerpo antes de combinar:', fields);
    console.log('Archivos recibidos:', files);

    req.body = { ...fields, files };
    next();
};
export default mergeBodyAndFiles