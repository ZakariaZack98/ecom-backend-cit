const { asyncHandler } = require("../utils/asyncHandler");
const { CustomError } = require("../helpers/customError.helper");
const { ApiResponse } = require("../helpers/ApiResponseMaker");
const { validateProduct } = require("../validation/product.validation");

//* Create a product
exports.createProduct = asyncHandler(async(req, res) => {
  const validatedData = validateProduct(req);
  
})