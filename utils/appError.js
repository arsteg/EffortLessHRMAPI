const constants = require('../constants');
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;

    // All 4** have fail, rest of them have error
    this.status = `${statusCode}`.startsWith('4') ? constants.APIResponseStatus.Failure : constants.APIResponseStatus.Error;

    // This is set to later check if this error is one predicted by us or not
    // So it means, that every error created by us will be 'operational error'
    this.isOperational = true;

    // This function will not occur in stack strace (error.stack)
    Error.captureStackTrace(this, this.constructor);
  }

  sendErrorJson(res) {
    return res.status(this.statusCode).json({
      status: this.status,
      message: this.message
    });
  }
}

module.exports = AppError;
