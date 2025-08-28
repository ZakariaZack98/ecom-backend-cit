const Joi = require("joi");
const { CustomError } = require("../helpers/customError.helper");

const subcategoryValidationSchema = Joi.object(
  {
    name: Joi.string()
      .trim()
      .min(3)
      .max(30)
      .pattern(/^[a-zA-Z0-9_.\s]+$/) // allows letters, numbers, underscore, dot, and spaces
      .required()
      .messages({
        "string.base": "Subcategory name must be a string",
        "string.empty": "Subcategory name cannot be empty",
        "string.min": "Subcategory name must be at least {#limit} characters long",
        "string.max": "Subcategory name cannot exceed {#limit} characters",
        "string.pattern.base":
          "Subcategory name can only contain letters (a-z, A-Z), numbers (0-9), underscores (_), dots (.) and spaces",
        "string.trim": "Leading or trailing spaces are not allowed",
        "any.required": "Subcategory name is required",
      }),
    category: Joi.string()
      .hex()
      .length(24)
      .required()
      .messages({
        "string.base": "Category must be a valid ObjectId",
        "string.hex": "Category must be a valid hexadecimal string",
        "string.length": "Category must be exactly 24 characters long",
        "any.required": "Category is required",
      }),
    discount: Joi.string()
      .hex()
      .length(24)
      .optional()
      .allow(null, '')
      .messages({
        "string.base": "Discount must be a valid ObjectId",
        "string.hex": "Discount must be a valid hexadecimal string",
        "string.length": "Discount must be exactly 24 characters long",
      }),
    isActive: Joi.boolean()
      .default(true)
      .messages({
        "boolean.base": "isActive must be a boolean value",
      }),
  },
  { abortEarly: true }
).unknown(true);

exports.validateSubcategory = async (req, res) => {
  try {
    const validatedData = await subcategoryValidationSchema.validateAsync(
      req.body
    );

    //* Validating image data if needed (commented out as not in schema, but keeping structure)
    // if(req.files?.image?.length > 1) {
    //   throw new CustomError(400, 'Only single image allowed')
    // }

    // const image = req.files?.image[0];
    // const allowedFormats = ['image/jpg', 'image/jpeg', 'image/gif', 'image/png', 'image/webp'];

    // if(image && image.size > 2097152) {
    //   throw new CustomError(400, 'Maximum size should be 2MB')
    // }

    // if(image && !allowedFormats.includes(image.mimetype)) {
    //   throw new CustomError(400, 'Invalid file type')
    // }

    return {
      name: validatedData.name,
      category: validatedData.category,
      discount: validatedData.discount || null,
      isActive: validatedData.isActive,
      // image: image // if you need image validation later
    };

  } catch (error) {
    console.log(error);
    res.status(400).json(new CustomError(400, error.message));
  }
};