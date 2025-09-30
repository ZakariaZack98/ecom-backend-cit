const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    reviewerName: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    image: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true, collection: "reviews" }
);

module.exports = mongoose.model("Review", reviewSchema);