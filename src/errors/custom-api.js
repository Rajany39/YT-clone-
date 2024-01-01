const { StatusCodes } = require("http-status-codes");

class CustomAPIError extends Error {
  constructor(message,statuscode,status) {
    super(message,status,statuscode);
    this.statusCode = statuscode || StatusCodes.INTERNAL_SERVER_ERROR
   

    

  }
}



module.exports = CustomAPIError
