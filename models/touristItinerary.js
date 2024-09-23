const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const touristItinerarySchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    activities: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Activity', 
        },
    ],
}, {
    timestamps: true, 
});

module.exports = mongoose.model('TouristItinerary', touristItinerarySchema);
