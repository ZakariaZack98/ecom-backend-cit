const mongoose = require("mongoose");
const { createSlug } = require("../helpers/slugMaker");

const discountSchema = new mongoose.Schema(
  {
    discountValidFrom: Date,
    discountValidTo: Date,
    discountName: String,
    slug: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
    },
    discountType: {
      type: String,
      enum: ["tk", "percentance"],
      required: true,
    },
    discountValueByAmount: Number,
    discountValueByPercentance: {
      type: Number,
      max: 100,
    },
    discountPlan: {
      type: String,
      enum: ["category", "subCategory", "product"],
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subcategory",
    },
    // product: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Product",
    // },
  },
  {
    timestamps: true,
  },
  { collection: "discount" }
);

// Check if category slug already exists or not
discountSchema.pre("save", async function (next) {
  const existingDiscount = await this.constructor.findOne({ slug: this.slug });
  if (existingDiscount && !existingDiscount._id.equals(this._id)) {
    throw new Error(`${this.discountName} already exists`);
  }
  next();
});

// Generate slug using slugify
discountSchema.pre("save", async function (next) {
  if (this.isModified("discountName")) {
    this.slug = createSlug(this.discountName);
  }
  next();
});

// Helpers =========================

function autoPopulate(next) {
  this.populate({
    path: 'category',
    select: '-__v',
  }).populate({
    path: 'subCategory',
    select: '-__v',
  }).populate({
    path: 'product',
    select: '-__v',
  });
  next();
}

function autoSort(next) {
  this.sort({
    createdAt: -1,
  });
  next();
}

// Populate before fetching
discountSchema.pre("find", autoPopulate, autoSort);
discountSchema.pre("findOne", autoPopulate);

module.exports = mongoose.model.Discount || mongoose.model("Discount", discountSchema, "discount");