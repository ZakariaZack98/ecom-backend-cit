const mongoose = require("mongoose");
const { createSlug } = require("../helpers/slugMaker");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, unique: true, trim: true,
      lowercase: true, },
    description: { type: String, required: true },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory",
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
    },
    discount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Discount",
    },
    images: [{}],
    tag: [{ type: String, required: true }],
    manufactureCountry: { type: String },
    rating: { type: Number, max: 5 },
    warrantyInformation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warranty",
    },
    shippingInformation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ShippingInfo",
    },
    variant: [{ type: mongoose.Schema.Types.ObjectId, ref: "Variant" }],
    variantType: {
      type: String,
      enum: ['single', 'multiple'],
      default: 'single'
    },
    availabilityStatus: { type: Boolean, required: true },
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
    sku: { type: String, required: true, unique: true },
    qrCode: { type: String },
    barCode: { type: String },
    groupUnit: {
      type: String,
      enum: ["Box", "Packet", "Dozen", "Custom"],
      required: true,
    },
    groupUnitQuantity: { type: Number, required: true },
    unit: { type: String, required: true },
    size: [{ type: String, required: true }],
    color: [{ type: String, required: true }],
    totalStock: { type: Number, required: true },
    warehouseLocation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
    },
    purchasePrice: { type: Number, min: 100, required: true },
    retailPrice: { type: Number, required: true },
    wholeSalePrice: { type: Number, required: true },
    minimunWholeSaleOrderQuantity: { type: Number, min: 100, required: true },
    minimumorde: { type: Number, required: true },
    instock: { type: Boolean, required: true },
    isActive: { type: Boolean, required: true },
  },
  { timestamps: true, collection: "products" }
);

//* Check category slug already exists or not
productSchema.pre("save", async function (next) {
  if (!this.slug) {
    this.slug = createSlug(this.name);
  }
  const existingProduct = await this.constructor.findOne({ slug: this.slug });
  if (existingProduct && !existingProduct._id.equals(this._id)) {
    throw new Error(`${this.name} already exists`);
  }
  next();
});

//* Make a slug using slugify
productSchema.pre("save", async function (next) {
  if (this.isModified("name")) {
    this.slug = createSlug(this.name);
  }
  next();
});

//? Helpers =========================
function autoPopulate(next) {
  this.populate([
    { path: "subCategory" },
    { path: "category" },
    { path: "brand" }
  ]);
  next();
}

function autoSort(next) {
  this.sort({
    createdAt: -1,
  });
  next();
}

productSchema.pre("find", autoPopulate, autoSort);
productSchema.pre("findOne", autoPopulate);

module.exports = mongoose.model("Product", productSchema);
