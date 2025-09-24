const mongoose = require("mongoose");
const { createSlug } = require("../helpers/slugMaker");

const brandSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
    },
    name: {
      type: String,
      trim: true,
      required: true,
    },
    image: {},
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
  { collection: "brands" }
);

// Check brand slug already exists or not
brandSchema.pre("save", async function (next) {
  const existingBrand = await this.constructor.findOne({ slug: this.slug });
  if (existingBrand && !existingBrand._id.equals(this._id)) {
    throw new Error(`${this.name} already exists`);
  }
  next();
});

// Make a slug using slugify
brandSchema.pre("save", async function (next) {
  if (this.isModified("name")) {
    this.slug = createSlug(this.name);
  }
  next();
});

// Populate before fetching
brandSchema.pre("find", function (next) {
  this.populate({
    path: "image",
  });
  next();
});

// Sort before fetching
brandSchema.pre("find", function (next) {
  this.sort({
    createdAt: -1,
  });
  next();
});

module.exports =
  mongoose.model.Brand || mongoose.model("Brand", brandSchema, "brands");