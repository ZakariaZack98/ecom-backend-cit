require("dotenv").config();
const { CustomError } = require("../helpers/customError.helper");
const User = require("../models/user.mdoel");
const { generateOTPEmailTemplate } = require("../templates/OTPTemplate");
const { asyncHandler } = require("../utils/asyncHandler");
const { validateUser } = require("../validation/user.validation");
const { mailer } = require("../helpers/nodeMailer");
const { ApiResponse } = require("../helpers/ApiResponseMaker");
const { sendOtpToEmail } = require("../utils/sendOTP.utils");
const jwt = require("jsonwebtoken");
const {
  generatePasswordResetEmail,
} = require("../templates/passwordResetTemplate");
const { sendLogoutSms, sendVerificationSms } = require("../helpers/sendSms");

exports.registration = asyncHandler(async (req, res) => {
  const validatedUser = await validateUser(req, res);
  const userData = new User({
    name: validatedUser.name,
    phone: validateUser.phone || null,
    email: validatedUser.email || null,
    password: validatedUser.password,
  }).save();

  // send verification email
  if(validateUser.email) {
    await sendOtpToEmail(validatedUser.email);
  ApiResponse.sendResponse(res, 200, "Please check your email to verify");
  }

  //send verificaion sms
  if(validateUser.phone) {
    const verificaionLink = `http://oururl.com/verify/${validateUser._id}`;
    const smsRes = await sendVerificationSms(validateUser.name, validateUser.phone, verificaionLink);
    if (smsResult.response_code != 202) {
      throw new CustomError(500, "Server failed to send sms");
    }
    ApiResponse.sendResponse(res, 200, "Please check your SMS to verify");
  }

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

// Verify email or phone
exports.verifyUser = asyncHandler(async (req, res) => {
  const { email, phone, otp } = req.body;
  if (!email && !phone) {
    throw new CustomError(401, "Email or Phone missing");
  }
  if (!otp) {
    throw new CustomError(401, "OTP missing");
  }
  const matchedUser = await User.findOne({
    $and: [
      { $or: [{email: req.body.email}, {phone: req.body.phone}] },
      { resetPasswordOTP: otp },
      { resetPasswordOTPExpire: { $gt: Date.now() } },
    ],
  });
  if (!matchedUser) {
    throw new CustomError(404, "User not found or OTP expired");
  }
  if(matchedUser.email) {
    matchedUser.emailVerified = true;
  }
  if(matchedUser.phone) {
    matchedUser.phoneVerified = true;
  }
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
  //! const matchedUser = await User.findOne({ $or: [{ email: req.body.email }, { phone: req.body.phone }] });
  const matchedUser = await User.findOne({ email, phone });
  if (!matchedUser) {
    throw new CustomError(404, "User not found");
  }
  console.log(matchedUser);
  const passwordMatch = await matchedUser.comparePassword(password);
  if (!passwordMatch) {
    throw new CustomError(401, "Password is wrong");
  }

  //* Generate tokens
  const accessToken = await matchedUser.generateAccessToken();
  const refreshToken = await matchedUser.generateRefreshToken();

  //* Save refresh tokens to cookies
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV == "development" ? false : true,
    sameSite: "none",
    path: "/",
    maxAge: 15 * 24 * 60 * 60 * 1000,
  });
  //* Save refresh token to DB
  matchedUser.refreshToken = refreshToken;
  await matchedUser.save();
  ApiResponse.sendResponse(res, 200, "Refresh token saved successfully", {
    name: matchedUser.name,
    accessToken,
  });
});

exports.logout = asyncHandler(async (req, res) => {
  //* Identify logged out user form access token
  const token = req?.body?.accessToken || req?.headers?.authorization;
  const userInfo = jwt.verify(token, process.env.ACCESSTOKEN_SECRET);
  const matchedUser = User.findById(userInfo.id);
  if (!matchedUser) {
    throw new CustomError(404, "User not found");
  }

  //* Clear refresh token and cookies
  matchedUser.refreshToken = null;
  await matchedUser.save();
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV == "development" ? false : true,
    sameSite: "none",
    path: "/",
    maxAge: 15 * 24 * 60 * 60 * 1000,
  });

  //* Send Logout Notification
  if (matchedUser.phone) {
    const smsResult = await sendLogoutSms(matchedUser.name, matchedUser.number);
    if (smsResult.response_code != 202) {
      throw new CustomError(500, "Server failed to send sms");
    }
  }

  return ApiResponse.sendResponse(200, "Logout Successfull", matchedUser);
});

//* Get a user using token

