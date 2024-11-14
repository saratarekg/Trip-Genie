const mongoose = require("mongoose");

const productSalesSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    sales: {
      type: Number,
      required: true,
    },
    revenue: {
      type: Number,
      required: true,
    },
    day: {
      type: Number,
      required: true,
    },
    month: {
      type: Number,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const ProductSales = mongoose.model("ProductSales", productSalesSchema);
module.exports = ProductSales;
