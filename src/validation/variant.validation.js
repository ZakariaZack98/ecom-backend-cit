const Joi = require("joi");
const { customError } = require("../helpers/customError.helper");

// Variant Validation Schema
const variantValidationSchema = Joi.object(
  {
    name: Joi.string().trim().min(2).max(50).required().messages({
      "string.empty": "Variant name is required",
      "string.min": "Variant name must be at least 2 characters long",
      "string.max": "Variant name must not exceed 50 characters",
      "any.required": "Variant name is required",
    }),

    product: Joi.string().required().messages({
      "string.empty": "Product reference is required",
      "any.required": "Product reference is required",
    }),

    sku: Joi.string().trim().required().messages({
      "string.empty": "SKU is required",
      "any.required": "SKU is required",
    }),

    barCode: Joi.string().trim().optional(),
    qrCode: Joi.string().trim().optional(),

    size: Joi.array().items(Joi.string().trim()).optional(),
    color: Joi.array().items(Joi.string().trim()).optional(),

    stockVariant: Joi.number().min(0).default(0).messages({
      "number.min": "Stock cannot be negative",
    }),

    warehouseLocation: Joi.string().trim().optional(),

    alertVariantStock: Joi.number().min(0).default(0).messages({
      "number.min": "Alert stock cannot be negative",
    }),

    purchasePrice: Joi.number().min(0).required().messages({
      "number.base": "Purchase price must be a number",
      "any.required": "Purchase price is required",
    }),

    retailPrice: Joi.number().min(0).required().messages({
      "number.base": "Retail price must be a number",
      "any.required": "Retail price is required",
    }),

    retailProfitMarginByPercentage: Joi.number()
      .min(0)
      .max(100)
      .optional()
      .messages({
        "number.min": "Retail margin cannot be less than 0",
        "number.max": "Retail margin cannot exceed 100",
      }),

    wholeSalePrice: Joi.number().min(0).optional(),
    wholeSaleProfitMarginByPercentage: Joi.number().min(0).max(100).optional(),

    stockAlert: Joi.boolean().truthy("true").falsy("false").optional(),
    inStock: Joi.boolean().truthy("true").falsy("false").optional(),
    isActive: Joi.boolean().truthy("true").falsy("false").optional(),
  },
  { abortEarly: true }
).unknown(true);

// Variant validation function
const validateVariant = async (req) => {
  try {
    const value = await variantValidationSchema.validateAsync(req.body);

    // image validation
    const images = req?.files?.images;
    const allowFormat = ["image/jpg", "image/png", "image/jpeg"];

    if (images && images.length > 10) {
      throw new customError(
        401,
        "You can upload a maximum of 10 product images"
      );
    }

    if (images) {
      images.forEach((img) => {
        if (img.size > 1024 * 1024 * 5) {
          throw new customError(401, "Each image must be below 5 MB");
        }
        if (!allowFormat.includes(img.mimetype)) {
          throw new customError(401, "Invalid format (use JPG, PNG, or JPEG)");
        }
      });
    }

    return { ...value, images: images || [] };
  } catch (error) {
    throw new customError(
      401,
      "variant validation error " +
        (error.details?.map((err) => err.message).join(", ") || error.message)
    );
  }
};

module.exports = { validateVariant };