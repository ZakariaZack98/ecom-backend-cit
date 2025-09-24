const { asyncHandler } = require("../utils/asyncHandler");
const { validateBrand } = require("../validation/brand.validation")
const { uploadToCloudinary, deleteFile } = require('../helpers/cloudinary');
const brandModel = require("../models/brand.model");
const { CustomError } = require("../helpers/customError.helper");
const { ApiResponse } = require("../helpers/ApiResponseMaker");

//* Create a new brand
exports.createBrand = asyncHandler(async(req, res) => {
  const {name, image} = await validateBrand(req);
  const imageAsset = await uploadToCloudinary(image.path);
  const brand = new brandModel({
    name,
    image: imageAsset
  })
  await brand.save();
  if(!brand) throw new CustomError(500, `Brand creation failed`);
  ApiResponse.sendResponse(res, 200, `Brand creation successful`, brand);
})

//* Get all brands
exports.getAllBrands = asyncHandler(async (req, res) => {
  const allBrands = await brandModel.find().sort({ createdAt: -1 });
  if (!allBrands) throw new CustomError(404, "Brands not found");
  ApiResponse.sendResponse(res, 200, "All data found", allBrands);
});

//* Get a single brand by slug
exports.getSingleBrand = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  if (!slug) throw new CustomError(401, "Slug not found");
  const singleBrand = await brandModel.findOne({ slug }).select("-__v");
  if (!singleBrand) throw new CustomError(401, "Brand not found");
  ApiResponse.sendResponse(res, 200, "Requested brand found", singleBrand);
});

//* Get active brand
exports.getActiveBrands = asyncHandler(async (req, res) => {
  const {active} = req.query;
  const activeBrands = await brandModel.find({ isActive: active }).sort({ createdAt: -1 });
  if (!activeBrands) throw new CustomError(404, "Brands not found");
  ApiResponse.sendResponse(res, 200, "All active brands found", activeBrands);
});

//* Update a brand
exports.updateBrand = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  if (!slug) throw new CustomError(401, "Slug not found");
  const matchedBrand = await brandModel.findOne({ slug }).select("-__v");
  if (!matchedBrand) throw new CustomError(401, "Brand not found");
  if (req.body.name) {
    matchedBrand.name = req.body.name;
  }
  if (req.files.image.length) {
    // delete previous saved image
    await deleteFile(matchedBrand.image.publicId);
    // upload new image
    const imageAsset = await uploadToCloudinary(req.files.image[0].path);
    matchedBrand.image = imageAsset;
  }
  await matchedBrand.save();
  ApiResponse.sendResponse(res, 200, "Brand update successful", matchedBrand);
});

//* Delete a brand
exports.deleteBrand = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  if (!slug) throw new CustomError(401, "Slug not found");
  const matchedBrand = await brandModel.findOne({ slug }).select("-__v");
  if (!matchedBrand) throw new CustomError(401, "Brand not found");
  // delete previous saved image
  await deleteFile(matchedBrand.image.publicId);
  await brandModel.findOneAndDelete({ slug });
  ApiResponse.sendResponse(res, 200, "Brand delete successful", matchedBrand);
});