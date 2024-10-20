const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Currency schema
const currencySchema = new Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
  },
  name: {
    type: String,
    required: true,
  },
  symbol: {
    type: String,
    required: false,
  },
});

// Create and export the Currency model
const Currency = mongoose.model('Currency', currencySchema);
module.exports = Currency;
