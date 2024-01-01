const success = (message, statusCode,data,res,repeatCount=undefined) => {
    return res.status(statusCode).json({
        code: statusCode,
        error: false,
        message:message,
        repeatCount,
        data :data
    });
};
const error = (message, statusCode,req,res) => {
    return res.status(statusCode).json({
        code: statusCode,
        error: true,
        status:false,
        message:message
    });
};
const insertSuccess = (message, statusCode,res) => {
    return res.status(statusCode).json({
        code: statusCode,
        error: false,
        status: true,
        message:message,
    }).end();
};
const insertError = (message, statusCode,res) => {
    return res.status(400).json({
        code: statusCode,
        error: true,
        status:false,
        message:message
    });
};
module.exports = {success,error,insertSuccess,insertError}