const { asyncHandler } = require("../utils/asyncHandler");
const { CustomError } = require("../helpers/customError.helper");
const { ApiResponse } = require("../helpers/ApiResponseMaker");
const { validateProduct } = require("../validation/product.validation");
const { uploadToCloudinary, deleteFile } = require("../helpers/cloudinary");
const productModel = require("../models/product.model");
const { generateQRCode } = require("../helpers/qrcodeGenerator");
const { generateBarcode } = require("../helpers/generate");

//* Create a product
exports.createProduct = asyncHandler(async (req, res) => {
  const validatedData = await validateProduct(req);

  const imageUploadPromises = validatedData.images.map((imgPath) =>
    uploadToCloudinary(imgPath)
  );
  const allImageAssets = await Promise.all(imageUploadPromises);
  const barCode =
    validatedData.barCode ?? (await generateBarcode(validatedData.sku));

  const newProduct = new productModel({
    ...validatedData,
    images: allImageAssets,
    barCode,
  });
  await newProduct.save();

  //! URL SHOULD COME FROM FRONT-END
  const qrCode =
    validatedData.qrCode ??
    (await generateQRCode(
      `https://localhost:3000/products/${newProduct.slug}`
    ));
  newProduct.qrCode = qrCode;
  await newProduct.save();
  if (!newProduct) throw new CustomError(500, "Product creation failed");

  ApiResponse.sendResponse(res, 200, "Product creation successful", newProduct);
});

//* Get all product
exports.getAllProducts = asyncHandler(async (req, res) => {
  const allProducts = await productModel.find().sort({ createdAt: -1 });
  if (!allProducts) throw new CustomError(404, "Product not found");
  ApiResponse.sendResponse(res, 200, "Products found", allProducts);
});

//* Get single product
exports.getSingleProduct = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  if (!slug) throw new CustomError(401, "no slug found");
  const matchedProduct = await productModel.findOne({ slug });
  if (!matchedProduct) throw new CustomError(404, "No product found");
  ApiResponse.sendResponse(res, 200, "product found", matchedProduct);
});

//* Update a product
exports.updateProduct = asyncHandler(async (req, res) => {
  const editedData = req.body; //! validation updates required
  console.log(editedData);
  const { slug } = req.params;
  if (!slug) throw new CustomError(401, "no slug found");
  const matchedProduct = await productModel.findOne({ slug });
  if (!matchedProduct) throw new CustomError(404, "No product found");
  const updatedProduct = await productModel.findOneAndUpdate(
    { slug },
    editedData,
    { new: true }
  );
  ApiResponse.sendResponse(res, 200, "Product updated", updatedProduct);
});

//* Update product images
exports.updateProductImages = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  if (!slug) throw new CustomError(401, "no slug found");
  const matchedProduct = await productModel.findOne({ slug });
  if (!matchedProduct) throw new CustomError(404, "No product found");
  for (let publicId of req.body.imagesToDelete) {
    await deleteFile(publicId);
    matchedProduct.images = matchedProduct.images.filter(
      (image) => image.publicId !== publicId
    );
  }
  for (let image of req.body.imagesToAdd) {
    const imageAsset = await uploadToCloudinary(image.path);
    matchedProduct.images.push(imageAsset);
  }
  await matchedProduct.save();
});

//* Get filtered products
exports.filterProducts = asyncHandler(async (req, res) => {
  const { category, subcategory, brands, minPrice, maxPrice } = req.query;

  const filter = {};

  //? Category filter
  if (category) {
    const categories = category.split(",").map(s => s.trim()).filter(Boolean);
    filter.category = categories.length > 1 ? { $in: categories } : categories[0];
  }

  //? Subcategory filter
  if (subcategory) {
    const subcategories = subcategory.split(",").map(s => s.trim()).filter(Boolean);
    filter.subCategory = subcategories.length > 1 ? { $in: subcategories } : subcategories[0];
  }

  //? Brand filter
  if (brands) {
    const brandList = brands.split(",").map(s => s.trim()).filter(Boolean);
    filter.brand = { $in: brandList };
  }

  //? Price filter
  if (minPrice || maxPrice) {
    filter.retailPrice = {};
    if (minPrice) filter.retailPrice.$gte = Number(minPrice);
    if (maxPrice) filter.retailPrice.$lte = Number(maxPrice);
  }

  const products = await productModel.find(filter).sort({ createdAt: -1 });

  if (!products || products.length === 0) {
    throw new CustomError(404, "No products found for given filters");
  }

  ApiResponse.sendResponse(res, 200, "Products found", products);
});

//* Delete a product
exports.deleteProduct = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const product = await productModel.findOneAndDelete({slug});
  ApiResponse.sendResponse(res, 200, 'product delete successful')
});
