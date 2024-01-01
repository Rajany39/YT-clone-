class BaseError extends Error {
    constructor (statusCode, isOperational, message) {
    super(message)
   
    Object.setPrototypeOf(this, new.target.prototype)

    this.statusCode = statusCode
    this.isOperational = isOperational
    // Error.captureStackTrace(this)
    }
   }
   
   module.exports = BaseError