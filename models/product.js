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

module.exports = mongoose.model('Product', productSchema);