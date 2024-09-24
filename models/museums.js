const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const museumSchema = new Schema({
    description: { 
        type: String, required: [true,'Please enter a description'] },

    location: {
        address:{type: String, required: [true,'Please enter an address']} ,
        city: {type: String, required: [true,'Please enter a city']},
        country: {type: String, required: [true,'Please enter a country']},
        
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


const Museum = mongoose.model('Museum', museumSchema);
module.exports = Museum;