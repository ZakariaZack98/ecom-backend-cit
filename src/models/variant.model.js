const mongoose = require("mongoose");
const { Schema } = mongoose;
const { customError } = require("../helpers/customError.helper");
const { createSlug } = require("../helpers/slugMaker");

const productVariantSchema = new Schema(
  {
    slug: {
      type: String,
      unique: true,
      index: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    sku: {
      type: String,
      unique: true,
      trim: true,
    },
    barCode: {
      type: String,
      trim: true,
    },
    qrCode: {
      type: String,
      trim: true,
    },
    size: [{ type: String, trim: true }],
    color: [{ type: String, trim: true }],
    stockVariant: { type: Number, default: 0, min: 0 },
    warehouseLocation: { type: Schema.Types.ObjectId, ref: "Warehouse" },
    alertVariantStock: { type: Number, default: 0, min: 0 },
    purchasePrice: { type: Number, required: true, min: 0 },
    retailPrice: { type: Number, required: true, min: 0 },
    retailProfitMarginByPercentage: { type: Number, min: 0, max: 100 },
    wholeSalePrice: { type: Number, min: 0 },
    stockAlert: { type: Boolean, default: false },
    inStock: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    images: [{}],
  },
  { timestamps: true }
);

productVariantSchema.pre("save", async function (next) {
  if (this.isModified("name")) {
    this.slug = createSlug(this.name)
  }
  next();
});

productVariantSchema.pre("save", async function (next) {
  if (!this.isModified("name") && !this.isNew) return next();

  const exists = await this.constructor.findOne({
    product: this.product,
    slug: this.slug,
  });

  if (exists && !exists._id.equals(this._id)) {
    return next(
      new customError(
        400,
        `Variant "${this.name}" already exists for this product`
      )
    );
  }
  next();
});

module.exports =
  mongoose.models.ProductVariant ||
  mongoose.model("ProductVariant", productVariantSchema);