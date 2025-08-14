const { CustomError } = require('../helpers/customError.helper');
const User = require('../models/user.mdoel');
const { generateOTPEmailTemplate } = require('../templates/OTPTemplate');
const { asyncHandler } = require('../utils/asyncHandler');
const { validateUser } = require('../validation/user.validation');
const {mailer} = require('../helpers/nodeMailer')

exports.registration = asyncHandler(async (req,res) => {
  const validatedUser = await validateUser(req, res);
  console.log(validatedUser);
  const userData = new User({
    name: validatedUser.name,
    email: validatedUser.email,
    password: validatedUser.password,
  }).save();

  // send verification email
  const templatesAndOTP = generateOTPEmailTemplate(validateUser.name, `https://google.com`, 10);
  const template = templatesAndOTP.html;
  const otp = templatesAndOTP.otp;
  const expireTime = Date.now() + 10 * 60 * 1000

  
  await mailer(validatedUser.email, 'Verify email', template);
  console.log('Email send successfully')


})