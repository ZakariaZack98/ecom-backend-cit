const { asyncHandler } = require("../utils/asyncHandler");
const { validateCategory } = require("../validation/category.validation");
const Category = require('../models/category.model');
const { ApiResponse } = require("../helpers/ApiResponseMaker");
const { uploadToCloudinary, deleteFile } = require("../helpers/cloudinary");
const categoryModel = require("../models/category.model");
const { CustomError } = require("../helpers/customError.helper");



exports.createCategory = asyncHandler(async(req, res) => {

  //* Save category to database
  const {name, image} = await validateCategory(req);
  const imageAsset = await uploadToCloudinary(image.path);
  const newCategory = await categoryModel.create(({name, image: imageAsset }))
  if(!newCategory) throw new CustomError(500, 'category creation failed')

  // * Send success response to client-side
  ApiResponse.sendResponse(res, 200, `Category ${name} saved successfully`, newCategory);
})



exports.getAllCategory = asyncHandler( async (req, res) => {
  const allCategory = await categoryModel.find().sort({createdAt: -1});
  if(!allCategory) throw new CustomError(404, 'Category not found');
  ApiResponse.sendResponse(res, 200, 'All data found', allCategory);
})



exports.getActiveCategory = asyncHandler( async (req, res) => {
  const {active} = req.query;
  const allActiveCategory = await categoryModel.find({isActive: active});
  if(!allActiveCategory) throw new CustomError(404, 'Category not found');
  ApiResponse.sendResponse(res, 200, 'Api data found', allActiveCategory);
})



exports.getSingleCategory = asyncHandler(async(req, res) => {
  const {slug} = req.params;
  if(!slug) throw new CustomError(401, 'Slug not found')
  const singleCategory = await categoryModel.findOne({slug}).select('-__v');
  if(!singleCategory) throw new CustomError(401, 'Category not found');
  ApiResponse.sendResponse(res, 200, 'requested category found', singleCategory);
})



exports.updateCategory = asyncHandler(async(req,res) => {
  const {slug} = req.params;
  if (!slug) throw new CustomError(401, "Slug not found");
  const matchedCategory = await categoryModel.findOne({ slug }).select("-__v");
  if (!matchedCategory) throw new CustomError(401, "Category not found");
  if(req.body.name) {
    matchedCategory.name = req.body.name;
  }
  if(req.files.image.length) {
    //* delete previous saved image
    await deleteFile(matchedCategory.image.publicId)
    //* upload new image
    const imageAsset = await uploadToCloudinary(req.files.image[0].path);
    matchedCategory.image = imageAsset;
  }
  await matchedCategory.save();
  ApiResponse.sendResponse(res, 200, 'category update successful', matchedCategory);
})



exports.deleteCategory = asyncHandler(async(req, res) => {
  const {slug} = req.params;
  if (!slug) throw new CustomError(401, "Slug not found");
  const matchedCategory = await categoryModel.findOne({ slug }).select("-__v");
  if (!matchedCategory) throw new CustomError(401, "Category not found");

  //* delete previous saved image
  await deleteFile(matchedCategory.image.publicId)

  await categoryModel.findOneAndDelete({slug})
  ApiResponse.sendResponse(res, 200, 'category delete successful', matchedCategory);
})