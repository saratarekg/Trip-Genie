const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const museumSchema = new Schema({
    description: { type: String, required: true },
    location: {
        address: String,
        city: String,
        country: String,
        coordinates: { type: [Number], index: '2dsphere' }, // For latitude and longitude
    },
    openingHours: {
        weekdays: String,
        weekends: String,
    },
    ticketPrices: {
        adult: Number,
        child: Number,
        
    },
    pictures: [String], // Array of GridFS filenames
});


const Blog = mongoose.model('Blog', blogSchema);
module.exports = Blog;