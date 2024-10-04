const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
         type: String,
          required: true 
        },
    picture: {
         type: String, 
         required: true 
        },
    price: {
         type: Number,
          required: true
         },
    description: {
      type: String, 
      required: true 
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Seller', // Reference to the Seller schema
      required: true
    }, 
    rating: {
          type: Number
          },     
    reviews: [
      {
        user: { type: String, required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, required: true }
      }
    ],
    quantity: {
          type: Number,
          required: true 
    }
  });

productSchema.statics.searchByNames = async function(name) {
  try {
    if(name === undefined || name === null || name === "") {
      return this.find().populate('seller').exec();
    }
    const products = await Product.find({ name: { $regex: new RegExp(name, 'i') } });
    if (!products || products.length === 0) {
      return res.status(200).json([]);
    }
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

productSchema.statics.filterByPrice = async function(minPrice, maxPrice) {
  try {
    const priceFilter = {};
    if (minPrice !== undefined) {
      priceFilter.$gte = minPrice;
    }
    if (maxPrice !== undefined) {
      priceFilter.$lte = maxPrice;
    }
    const filterConditions = {};

    if (minPrice !== undefined || maxPrice !== undefined) {
      filterConditions.price = priceFilter;
    }
    const products = await Product.find(filterConditions);
    if (!products || products.length === 0) {
      return res.status(200).json([]);
    }
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = mongoose.model('Product', productSchema);