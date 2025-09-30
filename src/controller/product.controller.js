const { asyncHandler } = require("../utils/asyncHandler");
const { CustomError } = require("../helpers/customError.helper");
const { ApiResponse } = require("../helpers/ApiResponseMaker");
const { validateProduct } = require("../validation/product.validation");
const { uploadToCloudinary, deleteFile } = require("../helpers/cloudinary");
const productModel = require('../models/product.model')

//* Create a product
exports.createProduct = asyncHandler(async(req, res) => {
  const validatedData = await validateProduct(req);
  const allImageAssets = [];
  validatedData.images.forEach(imgPath => {
    uploadToCloudinary(imgPath)
    .then(asset => allImageAssets.push(asset))
  });
  const newProduct = new productModel({
    ...validatedData,
    images: allImageAssets
  })
  await newProduct.save();
  if(!newProduct) throw new CustomError(500, 'product creation failed');
  ApiResponse.sendResponse(res, 200, 'Product creation successful', newProduct)
})