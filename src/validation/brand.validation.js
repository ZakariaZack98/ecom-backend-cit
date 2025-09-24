const Joi = require("joi");
const { CustomError } = require("../helpers/customError.helper");

const brandValidationSchema = Joi.object(
  {
    name: Joi.string()
      .trim()
      .min(3)
      .max(30)
      .pattern(/^[a-zA-Z0-9_.\s]+$/) // allows letters, numbers, underscore, dot, and spaces
      .required()
      .messages({
        "string.base": "Brand name must be a string",
        "string.empty": "Brand name cannot be empty",
        "string.min": "Brand name must be at least {#limit} characters long",
        "string.max": "Brand name cannot exceed {#limit} characters",
        "string.pattern.base":
          "Brand name can only contain letters (a-z, A-Z), numbers (0-9), underscores (_), dots (.), and spaces",
        "string.trim": "Leading or trailing spaces are not allowed",
        "any.required": "Brand name is required",
      }),
  },
  { abortEarly: true }
).unknown(true);

exports.validateBrand = async (req, res) => {
  try {
    const validatedData = await brandValidationSchema.validateAsync(
      req.body
    );

    const image = req.files?.image[0];
    const allowedFormats = ['image/jpg', 'image/jpeg', 'image/gif', 'image/png', 'image/webp'];

    if (image && image.size > 2097152) {
      throw new CustomError(400, 'Maximum size should be 2MB')
    }

    if (image && !allowedFormats.includes(image.mimetype)) {
      throw new CustomError(400, 'Invalid file type')
    }

    return {
      name: validatedData.name,
      image,
    };

  } catch (error) {
    console.log(error);
    res.status(401).json(new CustomError(400, error.message));
  }
};