require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Schema, Types } = mongoose;

const userSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      required: true,
      unique: [true, "email must be unique"],
    },
    phone: {
      type: Number,
      trim: true,
    },
    password: {
      type: String,
      trim: true,
      required: true,
    },
    image: {
      type: String,
      trim: true,
    },
    emailVerified: Boolean,
    phoneVerified: Boolean,
    address: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
      default: "Bangladesh",
    },
    zipCode: {
      type: Number,
      trim: true,
    },
    dateOfBirth: Date,
    gender: {
      type: String,
      trim: true,
      enum: ["male", "female", "others"],
    },
    lastLogin: Date,
    lastLogout: Date,
    cart: [
      {
        type: Types.ObjectId,
        ref: "Product",
      },
    ],
    wishList: [
      {
        type: Types.ObjectId,
        ref: "Product",
      },
    ],
    isNewsletterSubscribed: Boolean,
    roles: [
      {
        type: Types.ObjectId,
        ref: "Role",
      },
    ],
    Permission: [
      {
        type: Types.ObjectId,
        ref: "Permission",
      },
    ],
    resetPasswordOTP: Number,
    resetPasswordOTPExpire: Date,
    isTwoFactorEnabled: Boolean,
    isBlocked: Boolean,
    isActive: Boolean,
    refreshToken: {
      type: String,
      trim: true,
    },
  },
  { collection: "users" }
);

// * Make a hashed password with mongoose middleware ========================
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const hashPassword = await bcrypt.hash(this.password, 10);
    this.password = hashPassword;
  }
  next();
});

//  * Check user already exists or not ======================================
userSchema.pre("save", async function (next) {
  const existingUser = await this.constructor.findOne({email: this.email, phone: this.phone});
  if (existingUser && !existingUser._id.equals(this._id)) {
    throw new Error("User already exists");
  }
  next();
});

// * Compare/Match the human-readable password with hashed password =========
userSchema.methods.comparePassword = async function (plainPassword) {
  return await bcrypt.compare(plainPassword, this.password);
};

// * Generate access token  ==================================================
userSchema.methods.generateAccessToken = async function () {
  return jwt.sign(
    {
      id: this._id,
      email: this.email,
      role: this.role,
      phone: this.phone,
      permission: this.permission,
    },
    process.env.ACCESSTOKEN_SECRET,
    { expiresIn: process.env.ACCESSTOKEN_EXPIRE }
  );
};

// * Generate refresh token  ==================================================
userSchema.methods.generateRefreshToken = async function () {
  return jwt.sign(
    {
      id: this._id,
    },
    process.env.REFRESHTOKEN_SECRET,
    { expiresIn: process.env.REFRESHTOKEN_EXPIRE }
  );
};

// * Verify access token =====================================================
userSchema.methods.verifyAccessToken = async function (token) {
  return await jwt.verify(token, process.env.REFRESHTOKEN_SECRET);
};

module.exports = mongoose.model("User", userSchema, "users");
