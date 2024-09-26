const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const activitySchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    duration: {
        type: Number,
        required: true,
    },
    timeline: {
        start: {
            type: Date,
            required: true,
        },
        end: {
            type: Date,
            required: true,
        },
    },
    price: {
        type: Number,
        required: true,
    },
    category: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
        },
    ],
    tags: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tag',
        },
    ],
    specialDiscount: {
        type: Number,
        default: 0,
    },
    isBookingOpen: {
        type: Boolean,
        default: true,
    },
    rating: {
        type: Number
        }, 
    advertisor: {  // New field for the maker's ID
        type: mongoose.Schema.Types.ObjectId,
        ref: 'advertisor', // Replace 'User' with the appropriate model name for makers
        required: true, // Assuming it's required, you can set this to false if it's optional
    },
}, {
    timestamps: true,
});

activitySchema.statics.findByAdvertisor = function(advertisorID) {
    return this.find({ 'advertisor': advertisorID }).populate('advertisor').exec();
};

module.exports = mongoose.model('Activity', activitySchema);