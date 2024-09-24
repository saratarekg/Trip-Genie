const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

const tourismGovernorSchema = new Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        minlength: 3,
        match: [
            /^\S+$/, 
            'Username should not contain spaces.'
        ]
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

tourismGovernorSchema.pre('save', async function(next) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

tourismGovernorSchema.statics.login = async function(email,password){
    const tourismGovernor = await this.findOne({email});
    if(tourismGovernor){
        const auth = await bcrypt.compare(password, tourismGovernor.password )
        if(auth){
            return tourismGovernor;
        }
        throw Error('Incorrect password');
    }
    throw Error("Email is not registered");
}

const TourismGovernor = mongoose.model('TourismGovernor', tourismGovernorSchema);
module.exports = TourismGovernor;