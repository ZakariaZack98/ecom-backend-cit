const mongoose = require("mongoose");
const { createSlug } = require("../helpers/slugMaker");

const subcategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    slug: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    discount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Discount",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
  { collection: "subcategory" }
);

//* Make a slug using slugify
subcategorySchema.pre("save", async function (next) {
  if (this.isModified("name")) {
    this.slug = createSlug(this.name);
  }
  next();
});

//* Check subcategory slug already exists or not
subcategorySchema.pre("save", async function (next) {
  if (this.isModified("slug") || this.isNew) {
    const existingSubcategory = await this.constructor.findOne({ slug: this.slug });
    if (existingSubcategory && !existingSubcategory._id.equals(this._id)) {
      throw new Error(`${this.name} already exists`);
    }
  }
  next();
});

module.exports =
  mongoose.model.Subcategory || mongoose.model("Subcategory", subcategorySchema, 'subcategory');