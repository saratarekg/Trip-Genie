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

    governor: {  // New field for the maker's ID
        type: mongoose.Schema.Types.ObjectId,
        ref: 'governor', // Replace 'User' with the appropriate model name for makers
        required: true, // Assuming it's required, you can set this to false if it's optional
    },
});


historicalPlacesSchema.statics.findByGovernor = function(governorId) {
    return this.find({ governor: governorId }).populate('governor').exec();
};

const historicalPlaces = mongoose.model('Historical Places', historicalPlacesSchema);
module.exports = historicalPlaces;