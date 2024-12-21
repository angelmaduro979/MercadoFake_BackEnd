class ErrorValidateBuilder{
    constructor(){
        this.response={
            timestamp: new Date().toISOString(),
            error_code:'',
            error_message: null,
            path:''
        }
    }

    setError_code(error_code){
        this.response.error_code=error_code;
        return this
    };
    setError_message(error_message){
        this.response.error_message=error_message;
        return this
    };
    setPath(path){
        this.response.path=path;
        return this
    }

    build(){
        return this. response
    }
}

export default ErrorValidateBuilder