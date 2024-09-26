const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

const advertiserSchema = new Schema({
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
        trim: true,
        minlength: [3, 'Username must be at least 3 characters long']
    },
    name: {
        type: String,
        required: false,
      },
      description: {
        type: String,
        required: false,
      },
      website: {
        type: String,
        required: false,
      },
      hotline: {
        type: String,
      },
      logoUrl: {
        type: String,
      },
      accepted: {
        type: Boolean,
        default: false 
    }
}, { timestamps: true });

advertiserSchema.pre('save', async function(next) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

advertiserSchema.statics.login = async function(email,password){
    const advertiser = await this.findOne({email});
    if(advertiser){
        const auth = await bcrypt.compare(password, advertiser.password )
        if(auth){
            return advertiser;
        }
        throw Error('Incorrect password');
    }
    throw Error("Email is not registered");
}

const Advertiser = mongoose.model('Advertiser', advertiserSchema);
module.exports = Advertiser;