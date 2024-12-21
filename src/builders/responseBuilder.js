class ResponseBuilder{
    constructor(){
        this.response={
            timestamp: new Date().toISOString(),
            ok: null,
            status: 0,
            message: "",
            data: {},
            error: null
        }
    }

    setOk(ok){
        this.response.ok=ok
        return this
    }

    setStatus(status){
        this.response.status=status
        return this
    }

    setMessage(message){
        this.response.message=message
        return this
    }

    setData(data){
        this.response.data=data
        return this
    }
    setError(error){
        this.response.error=error
        return this
    }

    build(){
        return this.response
    }
    
}

export default ResponseBuilder