const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tourismGovernorSchema = new Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        minlength: 3
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 8,
        match: [
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/, 
            'Password must contain at least 8 characters, including at least one uppercase letter, one lowercase letter, one number'
        ]
    }
 
  

}, { timestamps: true });

const TourismGovernor = mongoose.model('TourismGovernor', tourismGovernorSchema);
module.exports = TourismGovernor;