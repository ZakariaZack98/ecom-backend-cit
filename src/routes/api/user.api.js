const express = require('express');
const _ = express.Router();
const userController = require('../../controller/user.controller')
_.route('/registration').post(userController.registration);
_.route('/verify-email').post(userController.verifyEmail);
_.route('/resend-otp').post(userController.resendOtp);
_.route('/forgot-password').post(userController.forgotPassword);
_.route('/reset-password').post(userController.resetPassword);
_.route('/login').post(userController.login);

module.exports = _;