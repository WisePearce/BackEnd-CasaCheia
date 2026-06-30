class AppError extends Error{

constructor(message, statusCode = 500){
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4')?'fail':'error';
    this.isOperacional = true;

    Error.captureStackTrace(this, this.constructor);
}
}


export default AppError;