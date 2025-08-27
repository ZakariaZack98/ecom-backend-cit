const { log } = require("console");
const { CustomError } = require("./customError.helper");
const fs = require("fs");
require("dotenv").config();
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUDNAME,
  api_key: process.env.CLOUDINARY_APIKEY,
  api_secret: process.env.CLOUDINARY_APISECRET,
});

exports.uploadToCloudinary = async (filepath) => {
  try {
    if (!filepath || !fs.existsSync(filepath))
      throw new CustomError(401, "File path does not exists");
    const uploadResponse = await cloudinary.uploader.upload(filepath, {
      resource_type: "image",
      quality: 'auto'
    });
    if(uploadResponse) {
      fs.unlinkSync(filepath);
    }
    const {public_id, secure_url} = uploadResponse;
    return {
      publicId: public_id, 
      url: secure_url
    } 
  } catch (error) {
    if(fs.existsSync(filepath)) {
      fs.unlinkSync(filepath); 
    }
    throw new CustomError(500, "Failed to upload image " + error.message);
  }
};

exports.deleteFile = async (publicId) => {
  try {
    if(!publicId) throw new CustomError('public id not found');
    const response = await cloudinary.uploader.destroy(publicId);
    return response;
  } catch (error) {
    
  }
}