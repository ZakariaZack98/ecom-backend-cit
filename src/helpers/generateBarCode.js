const { CustomError } = require('./customError.helper')
const BwipJs = require("bwip-js");

exports.generateBarcode = async (text) => {
  if (!text) throw new CustomError(401, "No text to generate barcode");
  try {
    return await BwipJs.toSVG({
      bcid: "code128", // Barcode type
      text: text, // Text to encode
      height: 12, // Bar height, in millimeters
      includetext: true, // Show human-readable text
      textxalign: "center", // Always good to set this
      textcolor: "#000000", // Red Black
    });
  } catch (error) {
    throw new CustomError(
      500,
      `Error generating barcode: ${error.message || error}`
    );
  }
};
