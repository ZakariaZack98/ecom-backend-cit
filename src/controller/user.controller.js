const { CustomError } = require('../helpers/customError.helper');
const User = require('../models/user.mdoel');
const { asyncHandler } = require('../utils/asyncHandler');

exports.registration = asyncHandler(async (req,res) => {
  throw new CustomError(401, 'You are unauthorized')
})