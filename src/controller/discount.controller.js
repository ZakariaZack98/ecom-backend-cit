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

//* Get all discount
exports.getAllDiscount = asyncHandler(async(_, res) => {
  const allDiscounts = await discountModel.find().sort({createdAt: -1});
  if(allDiscounts.length === 0) throw new CustomError(404, 'category not found');
  ApiResponse.sendResponse(res, 200, 'discounts found', allDiscounts);
})

//* Get single discount
exports.getSingleDiscount = asyncHandler(async(req, res) => {
  const {slug} = req.params;
  const matchedDiscount = await discountModel.findOne({slug});
  if(!matchedDiscount) throw new CustomError(404, 'Discount not found');
  ApiResponse.sendResponse(res, 200, 'discount found', matchedDiscount);
})

//* Update discount
exports.updateDiscount = asyncHandler(async(req, res) => {
  const {slug} = req.params;
  const matchedDiscount = await discountModel.findOne({slug});
  if(!matchedDiscount) throw new CustomError(404, 'Discount not found');
  const validatedData = await validateDiscount(req);

  //* Update if the category/subcategory/model changed
  if(validatedData.discountPlan === 'category' && validatedData.category) {
    //* Clear previous record
    if(matchedDiscount.subCategory) {
      await subcategoryModel.findByIdAndUpdate(matchedDiscount.subCategory, {discount: null})
    }
    await categoryModel.findByIdAndUpdate(validatedData.category, {discount: matchedDiscount._id})
  }
  if(validatedData.discountPlan === 'subCategory' && validatedData.subCategory) {
    //* Clear previous record
    if(matchedDiscount.category) {
      await categoryModel.findByIdAndUpdate(matchedDiscount.category, {discount: null})
    }
    await subcategoryModel.findByIdAndUpdate(validatedData.subCategory, {discount: matchedDiscount._id})
  }
  const updatedDiscount = await discountModel.findOneAndUpdate({slug}, validatedData, {new:true});
  ApiResponse.sendResponse(res, 200, 'Discount updated', updatedDiscount)
});

//* Delete a discount
exports.deleteDiscount = asyncHandler(async(req, res) => {
  const {slug} = req.params;
  const matchedDiscount = await discountModel.findOne({slug});
  if(!matchedDiscount) throw new CustomError(404, 'Discount not found');
  //* Refference cleanup
  if(matchedDiscount.category) {
    await categoryModel.findByIdAndUpdate(matchedDiscount.category, {discount: null})
  }
  if(matchedDiscount.subCategory) {
    await subcategoryModel.findByIdAndUpdate(matchedDiscount.subCategory, {discount: null})
  }
  //* Delete and send response
  await discountModel.findOneAndDelete({slug})
  ApiResponse.sendResponse(res, 200, 'discount found', matchedDiscount);
})