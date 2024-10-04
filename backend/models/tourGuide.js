const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

const tourGuideSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/.+@.+\..+/, 'Please enter a valid email address']
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
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: [3, 'Username must be at least 3 characters long']
    },
    nationality: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Nationality',
        required: true,
        trim: true
    },
    mobile: {
        type: String,
        required: true,
        trim: true,
        match: [/^\+\d{1,3}\d{7,15}$/, 'Please enter a valid phone number with a country code and 7 to 15 digits.']
    },
    yearsOfExperience: {
        type: Number,
        required: true,
        min: [0, 'Experience cannot be negative'],
        max: [50, 'Experience cannot exceed 50 years'],
        validate: {
            validator: Number.isInteger,
            message: '{VALUE} is not an integer value'
        }
    },
    previousWorks: [{
        title: {
            type: String,
            required: true,
            trim: true
        },
        company: {
            type: String,
            required: true,
            trim: true
        },
        duration: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            trim: true
        }
    }],
    isAccepted: {
        type: Boolean,
        default: false 
    }

}, { timestamps: true });

tourGuideSchema.pre('save', async function(next) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

tourGuideSchema.statics.login = async function(username,password){
    let tourGuide = await this.findOne({username});
    if(tourGuide===null || tourGuide===undefined){
        tourGuide = await this.findOne({email:username});
    }
    if(tourGuide){
        const auth = await bcrypt.compare(password, tourGuide.password )
        if(auth){
            return tourGuide;
        }
        throw Error('Incorrect password');
    }
    throw Error("Email/Username is not registered");
}

const TourGuide = mongoose.model('TourGuide', tourGuideSchema);
module.exports = TourGuide;