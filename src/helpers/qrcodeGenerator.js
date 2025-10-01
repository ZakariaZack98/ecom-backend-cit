const qrCode = require('qrcode')
const { CustomError } = require('./customError.helper')
exports.generateQRCode = async (data) => {
  if(!data) throw new CustomError(`No data found for QR code`)
  try {
    return await qrCode.toDataURL(data, 
      {
        errorCorrectionLevel: 'H',
        type: 'image/jpeg',
        quality: 0.3,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      },
    )
  } catch (error) {
    throw new CustomError('Error generating QR code ', error)
  }
}