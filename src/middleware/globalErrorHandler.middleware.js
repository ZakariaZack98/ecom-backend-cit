require("dotenv").config();
exports.globalErrorHandler = (error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  if (error.isOperationalError) {
    return res.status(statusCode).json({
      message: 'server failed',
    });
  }

  if (process.env.NODE_ENV == "production") {
    return res.status(statusCode).json({
      message: error.message,
      status: error.status,
    });
  } else {
    return res.status(statusCode).json({
      message: error.message,
      status: error.status,
      statusCode: error.statusCode,
      isOperationalError: error.isOperationalError,
      data: error.data,
    });
  }
};
