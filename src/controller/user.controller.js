const { CustomError } = require("../helpers/customError.helper");
const User = require("../models/user.mdoel");
const { generateOTPEmailTemplate } = require("../templates/OTPTemplate");
const { asyncHandler } = require("../utils/asyncHandler");
const { validateUser } = require("../validation/user.validation");
const { mailer } = require("../helpers/nodeMailer");
const { ApiResponse } = require("../helpers/ApiResponseMaker");
const { sendOtpToEmail } = require("../utils/sendOTP.utils");
const {
  generatePasswordResetEmail,
} = require("../templates/passwordResetTemplate");

exports.registration = asyncHandler(async (req, res) => {
  const validatedUser = await validateUser(req, res);
  const userData = new User({
    name: validatedUser.name,
    email: validatedUser.email,
    password: validatedUser.password,
  }).save();

  // send verification email
  await sendOtpToEmail(validatedUser.email);
  ApiResponse.sendResponse(res, 200, "Please check your email to verify");

  // const templatesAndOTP = generateOTPEmailTemplate(
  //   validateUser.name,
  //   `https://google.com`,
  //   10
  // );
  // const template = templatesAndOTP.html;
  // const otp = templatesAndOTP.otp;
  // const expireTime = Date.now() + 10 * 60 * 1000;
  // (await userData).resetPasswordOTP = otp;
  // (await userData).resetPasswordOTPExpire = expireTime;
  // (await userData).save();

  // await mailer(validatedUser.email, "Verify email", template);
  // console.log("Email send successfully");
  // res.status(200).json({
  //   message: "Please check your email to verify"
  // })
});

// Verify email
exports.verifyEmail = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    throw new CustomError(401, "Email or OTP missing");
  }
  const matchedUser = await User.findOne({
    $and: [
      { email },
      { resetPasswordOTP: otp },
      { resetPasswordOTPExpire: { $gt: Date.now() } },
    ],
  });
  if (!matchedUser) {
    throw new CustomError(404, "User not found or OTP expired");
  }
  matchedUser.emailVerified = true;
  matchedUser.resetPasswordOTP = null;
  matchedUser.resetPasswordOTPExpire = null;
  await matchedUser.save();
  ApiResponse.sendResponse(res, 200, "Verification successful", matchedUser);
});

// Re-send OTP
exports.resendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  await sendOtpToEmail(email);
  ApiResponse.sendResponse(res, 200, "Please check your email to verify");
});

// Forgot Password
exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const userData = await User.findOne({ email });
  if (!userData) {
    throw new CustomError(404, "User not found");
  }
  const flink = "https://google.com";
  const template = generatePasswordResetEmail(userData.name, flink, 10);
  await mailer(email, "Reset Password", template);
  ApiResponse.sendResponse(
    res,
    200,
    "Password reset link has been sent to your email."
  );
});

// Reset Password
exports.resetPassword = asyncHandler(async (req, res) => {
  const { email, newPassword, confirmPassword } = req.body;
  if (!email || !newPassword || !confirmPassword) {
    throw new CustomError(404, "email or password missing");
  }
  if (newPassword != confirmPassword) {
    throw new CustomError(404, "passwords did not match");
  }
  const userData = await User.findOne({ email });
  if (!userData) {
    throw new CustomError(404, "User not found");
  }
  userData.password = newPassword;
  await userData.save();
  ApiResponse.sendResponse(res, 200, "Password reset successfull");
});

// Login
exports.login = asyncHandler(async (req, res) => {
  const userData = await validateUser(req);
  const { email, phone, password } = userData;
  const matchedUser = await User.findOne({ $or: [{ email }, { phone }] });
  if (!matchedUser) {
    throw new CustomError(404, "User not found");
  }
  const passwordMatch = matchedUser.comparePassword(password);
  if(!passwordMatch) {
    throw new CustomError(401, 'Password is wrong')
  }
  //* Generate tokens
  const accessToken = await matchedUser.generateAccessToken();
  const refreshToken = await matchedUser.generateRefreshToken();
  //* Save access tokens to cookies
  
});
