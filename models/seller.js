const mongoose = require('mongoose');

const sellerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    accepted: {
        type: Boolean,
        default: false 
    },
});

const Seller = mongoose.model('Seller', sellerSchema);
module.exports = Seller;