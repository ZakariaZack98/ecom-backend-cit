const { customError } = require("../helpers/customError");
const variantModel = require("../models/variant.model");
const { asyncHandler } = require("../utils/asyncHandler");
const { validateVariant } = require("../validation/variant.validation");
const productModel = require("../models/product.model");
const { uploadToCloudinary } = require("../helpers/cloudinary");
const { ApiResponse } = require("../helpers/ApiResponseMaker");

exports.createVariant = asyncHandler(async (req, res) => {
  const data = await validateVariant(req);

  let imageUrl = await Promise.all(
    data.images.map((img) => uploadToCloudinary(img.path))
  );
  console.log(data.images);
  const variant = await variantModel.create({ ...data, image: imageUrl });
  if (!variant) {
    throw new customError(500, "variant not created");
  }

  const checkUpdateProduct = await productModel.findOneAndUpdate(
    { _id: data.product },
    { $push: { variants: variant._id } },
    { new: true }
  );
  if (!checkUpdateProduct) {
    throw new customError(500, "variant not push");
  }
  ApiResponse.sendResponse(res, "variation created successfully", 201, variant);
});

exports.getAllVariant = asyncHandler(async (_, res) => {
  const variant = await variantModel
    .find()
    .populate("product")
    .sort({ createdAt: -1 });
  if (!variant || variant.length === 0) {
    throw new customError(500, "no variant found");
  }
  ApiResponse.sendResponse(res, "variation fetched successfully", 201, variant);
});

exports.updateVariant = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const data = req.body;
  const existingVariant = await variantModel.findOne({ slug });

  if (!existingVariant) {
    throw new customError(500, "variant not found");
  }
  const productChanged =
    data.product.toString() !== existingVariant.product.toString();
  const updateVariant = await variantModel.findOneAndUpdate(
    { slug },
    { ...data },
    { new: true }
  );
  if (!updateVariant) {
    throw new customError(500, "variant not updated!!!");
  }
  if (productChanged) {
    // remove old variant
    await productModel.findOneAndUpdate(existingVariant.product, {
      $pull: { variants: existingVariant._id },
    });
    // add new variant
    await productModel.findByIdAndUpdate(updateVariant.product, {
      $push: {
        variants: updateVariant._id,
      },
    });
  }
  ApiResponse.sendResponse(
    res,
    "variation updated successfully",
    201,
    updateVariant
  );
});

exports.deleteVariant = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const existingVariant = await variantModel.findOneAndDelete({ slug });

  if (!existingVariant) {
    throw new customError(500, "variant not found");
  }

  ApiResponse.sendResponse(
    res,
    "variation deleted successfully",
    201,
    existingVariant
  );
});