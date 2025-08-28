const { ApiResponse } = require("../helpers/ApiResponseMaker");
const { CustomError } = require("../helpers/customError.helper");
const categoryModel = require("../models/category.model");
const subcategoryModel = require("../models/subcategory.model");
const { findById } = require("../models/user.mdoel");
const { asyncHandler } = require("../utils/asyncHandler");
const { validateSubcategory } = require("../validation/subcategory.validation");

// * Create sub category
exports.createSubcategory = asyncHandler(async (req, res) => {
  const validatedData = await validateSubcategory(req);
  const subcategory = await subcategoryModel.create(validatedData);
  if(!subcategory) throw new CustomError(500, 'failed to create subcatogory.')
  // update category db
  await categoryModel.findOneAndUpdate({_id: validatedData.category}, {$push: {subcategory: subcategory._id}}, {new: true});
  // send response
  ApiResponse.sendResponse(res, 200, 'subcategory saved successfully', subcategory)
})

//* Get all subcategory
exports.getAllSubcategory = asyncHandler(async(req, res) => {
  const allSubCategory = await subcategoryModel.find().sort({createdAt: -1});
  if(!allSubCategory || allSubCategory.length == 0) throw new CustomError(404, 'Subcategory not found');
  ApiResponse.sendResponse(res, 200, 'subcategory found', allSubCategory)
})

//* Get all active subcategory
exports.getActiveSubcategory = asyncHandler( async (req, res) => {
  const {active} = req.query;
  const allActiveSubategory = await subcategoryModel.find({isActive: active});
  if(!allActiveSubategory || allActiveSubategory.length == 0) throw new CustomError(404, 'Subcategory not found');
  ApiResponse.sendResponse(res, 200, 'Api data found', allActiveSubategory);
})

//* Get single subcategory
exports.getSingleSubcategory = asyncHandler(async(req, res) => {
  const {slug} = req.params;
  if(!slug) throw new CustomError(401, 'slug missing')
  const matchedSubcategory = await subcategoryModel.findOne({slug});
  if(!matchedSubcategory) throw new CustomError(404, 'subcategory does not exists');
  ApiResponse.sendResponse(res, 200, 'Subcategory found', matchedSubcategory)
})

//* Update subcategory
exports.updateSubcategory = asyncHandler(async(req, res) => {
  const {slug} = req.params;
  if(!slug) throw new CustomError(401, 'slug missing')
  const matchedSubcategory = await subcategoryModel.findOne({slug});
  if(req.body.name) {
    matchedSubcategory.name = req.body.name;
    await matchedSubcategory.save();
  }
  if(req.body.category) {
    // remove from prev category
    await categoryModel.findOneAndUpdate({_id: matchedSubcategory.category._id}, {$pull: {subcategory: matchedSubcategory._id}}, {new: true})
    // add to new category
    await categoryModel.findOneAndUpdate({_id: req.body.category}, {$push: {subcategory: matchedSubcategory._id}}, {new: true})
    // change the category id
    matchedSubcategory.category = req.body.category;
    await matchedSubcategory.save();
  }
  ApiResponse.sendResponse(res, 200, 'Subcategory updated successfully', matchedSubcategory);
})

// * Delete subcategory
exports.deleteSubcategory = asyncHandler(async(req, res) => {
  const {slug} = req.params;
  if(!slug) throw new CustomError(401, 'slug missing')
  const matchedSubcategory = await subcategoryModel.findOne({slug});
console.log(matchedSubcategory);

  // remove from parent category
  await categoryModel.findOneAndUpdate({_id: matchedSubcategory.category._id}, {$pull: {subcategory: matchedSubcategory._id}}, {new: true})
  // delete subcategory
  await subcategoryModel.deleteOne({_id: matchedSubcategory._id});
  ApiResponse.sendResponse(res, 200, 'Subcategory deleted successfully');
})