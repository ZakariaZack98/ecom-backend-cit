exports.asyncHandler = fn => {
  return async (req, res, next) => {
    try {
      await fn()
    } catch (error) {
      next(error);
      console.log(error);
      
    }
  };
};
