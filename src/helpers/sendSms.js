const { generateVerificationSms } = require("../templates/smsTemplate")
const { CustomError } = require("./customError.helper")

exports.sendVerificationSms = async (username, number, verificationLink, expireTime = 5) => {
  try {
    await axios.post(process.env.BULKSMS_API, {
      api_key: process.env.BULKSMS_KEY,
      senderid: process.env.SENDER_ID,
      numbers: Array.isArray(number) ? number.join(',') : number,
      message: generateVerificationSms(username, verificationLink, expireTime)
    } )
  } catch (error) {
    throw new CustomError(500, `Sending SMS failed, ${error.message}`)
  }
}

exports.sendLogoutSms = async (username, number) => {
  try {
    await axios.post(process.env.BULKSMS_API, {
      api_key: process.env.BULKSMS_KEY,
      senderid: process.env.SENDER_ID,
      numbers: Array.isArray(number) ? number.join(',') : number,
      message: `Hello, ${username}, You have been logout successfully`
    } )
  } catch (error) {
    throw new CustomError(500, `Sending SMS failed, ${error.message}`)
  }
}