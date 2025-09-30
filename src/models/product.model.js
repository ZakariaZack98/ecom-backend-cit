const mongoose = require("mongoose");
const { createSlug } = require("../helpers/slugMaker");

const productSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  subCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubCategory",
    required: true,
  },
  brand: { type: mongoose.Schema.Types.ObjectId, ref: "Brand", required: true },
  discount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Discount",
    required: true,
  },
  image: [{ type: String, required: true }],
  tag: [{ type: String, required: true }],
  manufactureCountry: { type: String, required: true },
  rating: { type: Number, max: 5, required: true },
  warrantyInformation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Warranty",
    required: true,
  },
  shippingInformation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ShippingInfo",
    required: true,
  },
  variant: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Variant", required: true },
  ],
  availabilityStatus: { type: Boolean, required: true },
  reviews: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Review",
    required: true,
  },
  sku: { type: String, required: true, unique: true },
  qrCode: { type: String, required: true },
  barCode: { type: String, required: true },
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
    required: true,
  },
  purchasePrice: { type: Number, min: 100, required: true },
  retailPrice: { type: Number, required: true },
  wholeSalePrice: { type: Number, required: true },
  minimunWholeSaleOrderQuantity: { type: Number, min: 100, required: true },
  minimumorde: { type: Number, required: true },
  instock: { type: Boolean, required: true },
  isActive: { type: Boolean, required: true },
});

//* Check category slug already exists or not
productSchema.pre("save", async function (next) {
  const existingProduct = await this.constructor.findOne({slug});
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

productSchema.pre('find', autoPopulate, autoSort);
productSchema.pre('findOne', autoPopulate);

module.exports = mongoose.model("Product", productSchema);
