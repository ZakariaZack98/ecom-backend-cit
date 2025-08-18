const { asyncHandler } = require("../utils/asyncHandler");
const { validateCategory } = require("../validation/category.validation");
const Category = require('../models/category.model');
const { ApiResponse } = require("../helpers/ApiResponseMaker");

exports.createCategory = asyncHandler(async(req, res) => {

  //* Save category to database
  const {name, image} = await validateCategory(req);
  const newCategory = new Category({name, image});
  await newCategory.save();

  // * Send success response to client-side
  ApiResponse.sendResponse(res, 200, `Category ${name} saved successfully`, newCategory);
})