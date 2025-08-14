class ApiResponse {
  constructor(statusCode, message, data) {
    this.message = message;
    this.status = statusCode >= 400 && statusCode < 500 ? 'Client Error' : 'Server Error';
    this.statusCode = statusCode; 
    this.data = data;
  }

  static sendResponse(res, statusCode, message, data) {
    res.status(statusCode).json({
      statusCode: statusCode,
      data: data,
      message: message,
    })
  }
}

module.exports = { ApiResponse };