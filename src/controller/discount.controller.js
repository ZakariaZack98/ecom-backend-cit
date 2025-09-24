const { asyncHandler } = require("../utils/asyncHandler");
const { CustomError } = require("../helpers/customError.helper");
const { ApiResponse } = require("../helpers/ApiResponseMaker");
const { validateDiscount } = require('../validation/discount.validation');
const discountModel = require("../models/discount.model");
const categoryModel = require('../models/category.model');
const subcategoryModel = require("../models/subcategory.model");

//* Create a new discount
exports.createDiscount = asyncHandler(async(req, res) => {
  const validatedDiscount = await validateDiscount(req);
  const discount = new discountModel(validatedDiscount);
  console.log(validateDiscount.plan, validatedDiscount.category)
  if(!discount) throw new CustomError(400, 'Failed to create discount')
  if(validatedDiscount.discountPlan === 'category' && validatedDiscount.category) {
    await categoryModel.findByIdAndUpdate(validatedDiscount.category, {
      discount: discount._id
    })
  }
  if(validatedDiscount.discountPlan === 'subCategory' && validatedDiscount.subCategory) {
    await subcategoryModel.findByIdAndUpdate(validatedDiscount.subCategory, {
      discount: discount._id
    })
  }
  discount.save();
  ApiResponse.sendResponse(res, 200, 'discount created successfully');
})