const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const sellerSchema = new mongoose.Schema({
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
        required: false
    },
    description: {
        type: String,
        required: false
    },
    isAccepted: {
        type: Boolean,
        default: false 
    },
    sellerType: {
        type: String,
        enum: ['VTP', 'External Seller'], // Two types of sellers: VTP or External Seller
        required: true
      },
});

sellerSchema.pre('save', async function(next) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

sellerSchema.statics.login = async function(username,password){
    let seller = await this.findOne({username});
    if(seller===null || seller===undefined){
        seller = await this.findOne({email:username});
    }
    if(seller){
        const auth = await bcrypt.compare(password, seller.password )
        if(auth){
            return seller;
        }
        throw Error('Incorrect password');
    }
    throw Error("Email/Username is not registered");
}

const Seller = mongoose.model('Seller', sellerSchema);
module.exports = Seller;