const Joi = require("joi");
const { CustomError } = require("../helpers/customError.helper");

const categoryValidationSchema = Joi.object(
  {
    name: Joi.string()
      .trim()
      .min(3)
      .max(30)
      .pattern(/^[a-zA-Z0-9_.\s]+$/) // allows letters, numbers, underscore, dot, and spaces
      .required()
      .messages({
        "string.base": "Category name must be a string",
        "string.empty": "Category name cannot be empty",
        "string.min": "Category name must be at least {#limit} characters long",
        "string.max": "Category name cannot exceed {#limit} characters",
        "string.pattern.base":
          "Category name can only contain letters (a-z, A-Z), numbers (0-9), underscores (_), dots (.) and spaces",
        "string.trim": "Leading or trailing spaces are not allowed",
        "any.required": "Category name is required",
      }),
  },
  { abortEarly: true }
).unknown(true);

exports.validateCategory = async (req, res) => {
  try {
    const validatedData = await categoryValidationSchema.validateAsync(
      req.body
    );

    //* Validating image data
    if(req.files?.image?.length > 1) {
      throw new CustomError(400, 'Only single image allowed')
    }

    const image = req.files?.image[0];
    const allowedFormats = ['image/jpg', 'image/jpeg', 'image/gif', 'image/png', 'image/webp'];

    if(image.size > 2097152) {
      throw new CustomError(400, 'Maximum size should be 2MB')
    }

    if(!allowedFormats.includes(image.mimetype)) {
      throw new CustomError(400, 'Invalid file type')
    }

    return {
      name: validatedData.name,
      image: image.path
    };

  } catch (error) {
    console.log(error);
    res.status(401).json(new CustomError(400, error.message));
  }
};
