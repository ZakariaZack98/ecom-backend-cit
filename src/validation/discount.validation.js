const Joi = require("joi");
const { CustomError } = require("../helpers/customError.helper");

const discountValidationSchema = Joi.object(
  {
    discountValidFrom: Joi.date()
      .required()
      .messages({
        "date.base": "Discount valid from must be a valid date",
        "any.required": "Discount valid from date is required",
      }),
    discountValidTo: Joi.date()
      .greater(Joi.ref('discountValidFrom'))
      .required()
      .messages({
        "date.base": "Discount valid to must be a valid date",
        "date.greater": "Discount valid to must be after discount valid from date",
        "any.required": "Discount valid to date is required",
      }),
    discountName: Joi.string()
      .trim()
      .min(2)
      .max(100)
      .pattern(/^[a-zA-Z0-9_.\s\-]+$/)
      .required()
      .messages({
        "string.base": "Discount name must be a string",
        "string.empty": "Discount name cannot be empty",
        "string.min": "Discount name must be at least {#limit} characters long",
        "string.max": "Discount name cannot exceed {#limit} characters",
        "string.pattern.base": "Discount name can only contain letters, numbers, underscores, dots, hyphens and spaces",
        "any.required": "Discount name is required",
      }),
    slug: Joi.string()
      .trim()
      .lowercase()
      .pattern(/^[a-z0-9\-]+$/)
      .optional()
      .allow('', null)
      .messages({
        "string.base": "Slug must be a string",
        "string.pattern.base": "Slug can only contain lowercase letters, numbers, and hyphens",
      }),
    discountType: Joi.string()
      .valid("tk", "percentance")
      .required()
      .messages({
        "string.base": "Discount type must be a string",
        "any.only": "Discount type must be either 'tk' or 'percentance'",
        "any.required": "Discount type is required",
      }),
    discountValueByAmount: Joi.number()
      .positive()
      .precision(2)
      .when('discountType', {
        is: 'tk',
        then: Joi.required(),
        otherwise: Joi.optional().allow(null, '')
      })
      .messages({
        "number.base": "Discount value by amount must be a number",
        "number.positive": "Discount value by amount must be positive",
        "number.precision": "Discount value by amount can have up to 2 decimal places",
        "any.required": "Discount value by amount is required when discount type is 'tk'",
      }),
    discountValueByPercentance: Joi.number()
      .min(0)
      .max(100)
      .precision(2)
      .when('discountType', {
        is: 'percentance',
        then: Joi.required(),
        otherwise: Joi.optional().allow(null, '')
      })
      .messages({
        "number.base": "Discount value by percentance must be a number",
        "number.min": "Discount value by percentance cannot be less than 0",
        "number.max": "Discount value by percentance cannot exceed 100",
        "number.precision": "Discount value by percentance can have up to 2 decimal places",
        "any.required": "Discount value by percentance is required when discount type is 'percentance'",
      }),
    discountPlan: Joi.string()
      .valid("category", "subCategory", "product")
      .required()
      .messages({
        "string.base": "Discount plan must be a string",
        "any.only": "Discount plan must be either 'category', 'subCategory', or 'product'",
        "any.required": "Discount plan is required",
      }),
    category: Joi.string()
      .hex()
      .length(24)
      .when('discountPlan', {
        is: 'category',
        then: Joi.required(),
        otherwise: Joi.optional().allow(null, '')
      })
      .messages({
        "string.base": "Category must be a valid ObjectId",
        "string.hex": "Category must be a valid hexadecimal string",
        "string.length": "Category must be exactly 24 characters long",
        "any.required": "Category is required when discount plan is 'category'",
      }),
    subCategory: Joi.string()
      .hex()
      .length(24)
      .when('discountPlan', {
        is: 'subCategory',
        then: Joi.required(),
        otherwise: Joi.optional().allow(null, '')
      })
      .messages({
        "string.base": "Subcategory must be a valid ObjectId",
        "string.hex": "Subcategory must be a valid hexadecimal string",
        "string.length": "Subcategory must be exactly 24 characters long",
        "any.required": "Subcategory is required when discount plan is 'subCategory'",
      }),
    // product: Joi.string()
    //   .hex()
    //   .length(24)
    //   .when('discountPlan', {
    //     is: 'product',
    //     then: Joi.required(),
    //     otherwise: Joi.optional().allow(null, '')
    //   })
    //   .messages({
    //     "string.base": "Product must be a valid ObjectId",
    //     "string.hex": "Product must be a valid hexadecimal string",
    //     "string.length": "Product must be exactly 24 characters long",
    //     "any.required": "Product is required when discount plan is 'product'",
    //   }),
  },
  { abortEarly: true }
).unknown(true);

exports.validateDiscount = async (req, res) => {
  try {
    const validatedData = await discountValidationSchema.validateAsync(
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
      discountValidFrom: validatedData.discountValidFrom,
      discountValidTo: validatedData.discountValidTo,
      discountName: validatedData.discountName,
      slug: validatedData.slug || null,
      discountType: validatedData.discountType,
      discountValueByAmount: validatedData.discountValueByAmount || null,
      discountValueByPercentance: validatedData.discountValueByPercentance || null,
      discountPlan: validatedData.discountPlan,
      category: validatedData.category || null,
      subCategory: validatedData.subCategory || null,
      // product: validatedData.product || null,
    };

  } catch (error) {
    console.log(error);
    res.status(400).json(new CustomError(400, error.message));
  }
};