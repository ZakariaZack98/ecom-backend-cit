const Joi = require("joi");
const { CustomError } = require("../helpers/customError.helper");

const reviewValidationSchema = Joi.object(
  {
    reviewerName: Joi.string()
      .length(24)
      .required()
      .messages({
        "string.length": "Reviewer ID must be a valid 24-character ObjectId",
        "any.required": "Reviewer ID is required",
      }),

    comment: Joi.string()
      .trim()
      .min(3)
      .max(500)
      .required()
      .messages({
        "string.base": "Comment must be a string",
        "string.empty": "Comment cannot be empty",
        "string.min": "Comment must be at least {#limit} characters long",
        "string.max": "Comment cannot exceed {#limit} characters",
        "any.required": "Comment is required",
      }),

    rating: Joi.number()
      .min(1)
      .max(5)
      .required()
      .messages({
        "number.base": "Rating must be a number",
        "number.min": "Rating must be at least {#limit}",
        "number.max": "Rating cannot exceed {#limit}",
        "any.required": "Rating is required",
      }),

    image: Joi.string()
      .uri()
      .optional()
      .messages({
        "string.uri": "Image must be a valid URL",
      }),
  },
  { abortEarly: true }
).unknown(true);

exports.validateReview = async (req, res) => {
  try {
    const validatedData = await reviewValidationSchema.validateAsync(req.body);
    return validatedData;
  } catch (error) {
    console.log(error);
    res.status(401).json(new CustomError(400, error.message));
  }
};