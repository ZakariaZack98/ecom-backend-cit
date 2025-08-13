class CustomError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.status = statusCode >= 400 && statusCode < 500 ? 'Client Error' : 'Server Error';
    this.statusCode = statusCode;
    this.message = message;
    this.isClientError = statusCode >= 400 && statusCode < 500 ? true : false;
    this.isOperationalError = statusCode >= 400 && statusCode < 500 ? false : true;
    this.data = null;
  }
}

module.exports = { CustomError };