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
    subcategory: [{
      type: mongoose.Types.ObjectId,
      ref: "Subcategory"
    }],
    isActive: {
      type: Boolean,
      default: true,
    },
    discount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Discount"
    }
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

//? Helpers =========================
function autoPopulate(next) {
  this.populate({
    path: 'subcategory'
  })
  next();
}

function autoSort(next) {
  this.sort({
    createdAt: -1
  })
  next()
}

//* Populate before fetching
categorySchema.pre('find', autoPopulate, autoSort);
categorySchema.pre('findOne', autoPopulate);

module.exports =
  mongoose.model.Category || mongoose.model("Category", categorySchema, 'category');
