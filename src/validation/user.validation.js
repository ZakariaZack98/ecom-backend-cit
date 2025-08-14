const Joi = require("joi");
const {CustomError} = require('../helpers/customError.helper')

const userValidationSchema = Joi.object(
  {
    name: Joi.string()
      .trim()
      .min(3)
      .max(20)
      .pattern(/^[a-zA-Z0-9_.]+$/)
      .messages({
        "string.base": "Username must be a string",
        "string.empty": "Username cannot be empty",
        "string.min": "Username must be at least {#limit} characters",
        "string.max": "Username cannot exceed {#limit} characters",
        "string.pattern.base":
          "Username can only contain letters (a-z, A-Z), numbers (0-9), underscores (_), or dots (.)",
        "string.trim": "Spaces are not allowed in the username",
      }),
    email: Joi.string()
      .trim()
      .pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
      .message({
        "string.email": "Your email must be string",
        "string.pattern.base": "Your email is invalid",
        "string.trim": "Space not allowed",
      }),
    phone: Joi.string()
      .trim()
      .empty()
      .pattern(/^(?:\+88|88)?(01[3-9]\d{8})$/)
      .message({
        "string.base": "Phone number must be a string",
        "string.pattern.base":
          "Please provide a valid Bangladeshi phone number",
        "string.trim": "Space not allowed",
        "string.empty": "Input is empty",
      }),
    password: Joi.string()
      .min(8)
      .max(30)
      .pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/
      )
      .required()
      .messages({
        "string.required": "You must provide a password",
        "string.base": "Password must be a string",
        "string.min": "Password must be at least 8 characters long",
        "string.max": "Password cannot exceed 30 characters",
        "string.pattern.base":
          "Password must contain at least:\n" +
          "- 1 uppercase letter (A-Z)\n" +
          "- 1 lowercase letter (a-z)\n" +
          "- 1 number (0-9)\n" +
          "- 1 special character (@$!%*?&)",
      })
      .required(),
  },
  { abortEarly: true }
).unknown(true);


exports.validateUser = async (req,res) => {
  try {
    const validatedData = await userValidationSchema.validateAsync(req.body);
    return validatedData;
  } catch (error) {
    console.log(error);
    res.status(401).json(new CustomError(401, error.message))
  }
}