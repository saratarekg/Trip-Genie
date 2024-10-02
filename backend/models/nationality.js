const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const nationalitySchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        match: [/.+/, 'Please enter a valid nationality']
    },
    countryCode: {
        type: String,
        required: true,
        trim: true,
        uppercase: true,
        match: [/.+/, 'Please enter a valid country code']
    },
    flag: {
        type: String,
        trim: true
    }
});

module.exports = mongoose.model('Nationality',nationalitySchema);