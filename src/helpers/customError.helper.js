class CustomError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.status = statusCode >= 400 && statusCode < 500 ? 'Client Error' : 'Server Error';
    this.statusCode = statusCode;
    this.isClientError = statusCode >= 400 && statusCode < 500 ? true : false;
    this.isOperationalError = statusCode >= 400 && statusCode < 500 ? false : true;
    this.data = null;
  }

  toJSON() {
    return {
      status: this.status,
      statusCode: this.statusCode,
      isClientError: this.isClientError,
      isOperationalError: this.isOperationalError,
      data: this.data,
      message: this.message,
      stack: this.stack
    };
  }
}

module.exports = { CustomError };