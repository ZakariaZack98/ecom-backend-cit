const { asyncHandler } = require("./asyncHandler");
const User = require("../models/user.mdoel");
const { generateOTPEmailTemplate } = require("../templates/OTPTemplate");
const { mailer } = require("../helpers/nodeMailer");

exports.sendOtpToEmail = asyncHandler(async email => {
  if (!email) {
    throw new CustomError(401, "Email missing");
  }
  const userData = await User.findOne({email});
  if(!userData) {
    throw new CustomError(404, 'User not found');
  }
  const templatesAndOTP = generateOTPEmailTemplate(
    userData.name,
    `https://google.com`,
    10
  );
  const template = templatesAndOTP.html;
  const otp = templatesAndOTP.otp;
  const expireTime = Date.now() + 10 * 60 * 1000;
  userData.resetPasswordOTP = otp;
  userData.resetPasswordOTPExpire = expireTime;
  userData.save();

  await mailer(email, "Verify email", template);
  console.log("Email send successfully");
})