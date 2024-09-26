const mongoose = require('mongoose');
const Activity = require('./activity');

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

itinerarySchema.statics.findByFields = async function(searchCriteria) {
    if(searchCriteria === undefined || searchCriteria === null || searchCriteria === "") {
        return this.find().populate('tourGuide').populate('activities').exec();
    }
    const query = [];
    
    const activities = await Activity.findByFields(searchCriteria);
    const activityIds = activities.map(tag => tag._id);

    query.push({["title"] : { $regex: new RegExp(searchCriteria, 'i') }});  // Case-insensitive
    query.push({["description"] : { $regex: new RegExp(searchCriteria, 'i') }});  // Case-insensitive
    
    const cursor = this.find().cursor();

    for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
        for(const activityId of activityIds){
            if(doc.activities.includes(activityId)){
                query.push({ _id: doc._id });
                break;
            }
        }
    }

    return this.find({ $or: query }).populate('tourGuide').populate('activities').exec();  // Perform a search with the regex query
};

module.exports = mongoose.model('Itinerary', itinerarySchema);
