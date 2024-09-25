const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const itinerarySchema = new Schema({
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
    language: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    availableDates: [
        {
            date: {
                type: Date,
                required: true,
            },
            times: [
                {
                    startTime: {
                        type: String,
                        required: true,
                    },
                    endTime: {
                        type: String,
                        required: true,
                    },
                },
            ],
        },
    ],
    accessibility: {
        type: Boolean,
        required: true,
    },
    pickUpLocation: {
        type: String,
        required: true,
    },
    dropOffLocation: {
        type: String,
        required: true,
    },
    isBooked: {
        type: Boolean,
        required: true,
        default: false,
    },
    tourGuide: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TourGuide',
        required: true
      },
}, {
    timestamps: true, 
});

itinerarySchema.statics.findByTourGuide = function(tourGuideId) {
    return this.find({ tourGuide: tourGuideId }).populate('tourGuide').exec();
};

module.exports = mongoose.model('Itinerary', itinerarySchema);
