const mongoose = require("mongoose");
const { createSlug } = require("../helpers/slugMaker");

const categorySchema = new mongoose.Schema(
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
    image: {},
    isActive: {
      type: Boolean,
      default: true,
    },
    // discount: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Discount"
    // }
  },
  {
    timestamps: true,
  },
  { collection: "category" }
);


//* Check category slug already exists or not
categorySchema.pre("save", async function (next) {
  const existingCategory = await this.constructor.findOne({ slug: this.slug });
  if (existingCategory && !existingCategory._id.equals(this._id)) {
    throw new Error(`${this.name} already exists`);
  }
  next();
});

//* Make a slug using slugify
categorySchema.pre("save", async function (next) {
  if (this.isModified("name")) {
    this.slug = createSlug(this.name);
  }
  next();
});

module.exports =
  mongoose.model.Category || mongoose.model("Category", categorySchema, 'category');
