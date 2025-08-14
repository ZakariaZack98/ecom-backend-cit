const nodemailer = require('nodemailer');
const { CustomError } = require('./customError.helper');
const { generateOTPEmailTemplate } = require('../templates/OTPTemplate');

// Create a test account or replace with real credentials.
const transporter = nodemailer.createTransport({
  service: 'gmail',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.HOSTMAIL,
    pass: process.env.HOSTMAIL_PASSWORD,
  },
});

exports.mailer = async (userEmail, subject, template) => {
  try {
    const info = await transporter.sendMail({
    from: 'Ecom Backend HOST',
    to: userEmail,
    subject: subject,
    text: "Hello world?", // plain‑text body
    html: template, // HTML body
  });

  console.log("Message sent:", info.messageId);
  } catch (error) {
    throw new CustomError(500, 'Server failed to send email')
  }
}