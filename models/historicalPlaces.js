const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const historicalPlacesSchema = new Schema({
    description: { 
        type: String, required: [true,'Please enter a description'] },

    location: {
        address:{type: String, required: [true,'Please enter an address']} ,
        city: {type: String, required: [true,'Please enter a city']},
        country: {type: String, required: [true,'Please enter a country']},
        
    },
    historicalTag: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'HistoricalTag',
            required: [true,'Please enter a tag']
        },
    ],
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


const historicalPlaces = mongoose.model('Museum', historicalPlacesSchema);
module.exports = historicalPlaces;