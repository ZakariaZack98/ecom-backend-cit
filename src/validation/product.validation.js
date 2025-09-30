const Joi = require("joi");
const { CustomError } = require("../helpers/customError.helper");

const productValidationSchema = Joi.object(
  {
    name: Joi.string()
      .trim()
      .min(3)
      .max(100)
      .pattern(/^[a-zA-Z0-9_.\s]+$/)
      .required()
      .messages({
        "string.base": "Product name must be a string",
        "string.empty": "Product name cannot be empty",
        "string.min": "Product name must be at least {#limit} characters long",
        "string.max": "Product name cannot exceed {#limit} characters",
        "string.pattern.base":
          "Product name can only contain letters, numbers, underscores, dots, and spaces",
        "any.required": "Product name is required",
      }),

    slug: Joi.string().trim().lowercase().required(),
    description: Joi.string().trim().min(10).required(),

    category: Joi.string().length(24).required(),
    subCategory: Joi.string().length(24),
    brand: Joi.string().length(24).required(),
    discount: Joi.string().length(24),
    warrantyInformation: Joi.string().length(24),
    shippingInformation: Joi.string().length(24),
    variant: Joi.array().items(Joi.string().length(24)).min(1),
    warehouseLocation: Joi.string().length(24),
    reviews: Joi.string().length(24),

    tag: Joi.array().items(Joi.string().trim()).min(1),
    manufactureCountry: Joi.string().trim(),
    rating: Joi.number().min(0).max(5),

    sku: Joi.string().trim().required(),
    qrCode: Joi.string().trim(),
    barCode: Joi.string().trim(),

    groupUnit: Joi.string()
      .valid("Box", "Packet", "Dozen", "Custom")
      .required(),
    groupUnitQuantity: Joi.number().min(1).required(),
    unit: Joi.string().trim().required(),

    size: Joi.array().items(Joi.string().trim()).min(1).required(),
    color: Joi.array().items(Joi.string().trim()).min(1),

    totalStock: Joi.number().min(0).required(),
    purchasePrice: Joi.number().min(100).required(),
    retailPrice: Joi.number().min(0).required(),
    wholeSalePrice: Joi.number().min(0).required(),
    minimunWholeSaleOrderQuantity: Joi.number().min(100).required(),
    minimumorde: Joi.number().min(1).required(),

    availabilityStatus: Joi.boolean().required(),
    instock: Joi.boolean().required(),
    isActive: Joi.boolean().required(),
  },
  { abortEarly: true }
).unknown(true);

exports.validateProduct = async (req, res) => {
  try {
    const validatedData = await productValidationSchema.validateAsync(req.body);

    //* Validate image files
    if (!req.files?.image || req.files.image.length < 1) {
      throw new CustomError(400, "At least one product image is required");
    }

    const allowedFormats = [
      "image/jpg",
      "image/jpeg",
      "image/gif",
      "image/png",
      "image/webp",
    ];

    for (const file of req.files.image) {
      if (file.size > 2097152) {
        throw new CustomError(400, "Each image must be under 2MB");
      }
      if (!allowedFormats.includes(file.mimetype)) {
        throw new CustomError(400, "Invalid image format");
      }
    }

    return {
      ...validatedData,
      image: req.files.image.map((file) => file.path),
    };
  } catch (error) {
    console.log(error);
    res.status(401).json(new CustomError(400, error.message));
  }
};