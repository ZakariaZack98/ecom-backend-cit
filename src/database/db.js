const mongoose = require('mongoose');
require('dotenv').config;
exports.connectDatabase = async () => {
  try {
    const dbInfo = await mongoose.connect(`${process.env.MONGODB_URL}/ecom-backend-cit`);
    console.log(`database connection successfull: ${dbInfo.connection.host}`)
  } catch (error) {
    console.error('Database connection failed')
  }
}