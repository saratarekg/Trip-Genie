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
         type: String,
          required: true
         }, 
     rating: {
            type: Number,
             required: true
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

  productSchema.pre('save', function (next) {
     if (this.reviews.length > 0) {
       const totalRating = this.reviews.reduce((acc, review) => acc + review.rating, 0);
       this.rating = totalRating / this.reviews.length;
     } else {
       this.rating = 0; // No reviews, so rating is set to 0 or you can leave it null
     }
     next();
   });

module.exports = mongoose.model('Product', productSchema);