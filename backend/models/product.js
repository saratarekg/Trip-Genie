const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  picture: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Seller", // Reference to the Seller schema
    required: true,
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  reviews: [
    {
      user: { type: String, required: true },
      rating: { type: Number, required: true, min: 1, max: 5 },
      comment: { type: String, required: true },
    },
  ],
  quantity: {
    type: Number,
    required: true,
  },
});

productSchema.statics.searchByNames = async function (name) {
  try {
    if (name === undefined || name === null || name === "") {
      return this.find().populate("seller").exec(); // Return all products if no name is provided
    }

    const products = await this.find({
      name: { $regex: new RegExp(name, "i") },
    });
    return products; // Return the products to be handled by the controller
  } catch (error) {
    throw new Error(error.message); // Throw the error to be caught by the calling function
  }
};

productSchema.statics.filterByPrice = async function (minPrice, maxPrice) {
  try {
    const priceFilter = {};

    if (minPrice !== undefined) {
      priceFilter.$gte = minPrice;
    }
    if (maxPrice !== undefined) {
      priceFilter.$lte = maxPrice;
    }

    let products;
    // If minPrice or maxPrice is provided, use the filter conditions
    if (Object.keys(priceFilter).length > 0) {
      products = await this.find({ price: priceFilter });
    } else {
      // If no price filters are provided, return all products
      products = await this.find();
    }

    if (!products || products.length === 0) {
      return res.status(200).json([]);
    }

    return products;
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = mongoose.model("Product", productSchema);
