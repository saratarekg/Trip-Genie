const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

const touristSchema = new Schema({
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
    mobile: {
        type: String,
        required: true,
        trim: true,
        match: [/^\d{11}$/, 'Please enter a valid 11-digit mobile number']
    },
    nationality: {
        type: String,
        enum: ["Afghan", "Albanian", "Algerian", "American", "Andorran", "Angolan", "Antiguan", 
            "Argentinean", "Armenian", "Australian", "Austrian", "Azerbaijani", "Bahamian", "Bahraini",
            "Bangladeshi", "Barbadian", "Barbudan", "Batswana", "Belarusian", "Belgian", "Belizean", "Beninese", 
            "Bhutanese", "Bolivian", "Bosnian", "Brazilian", "British", "Bruneian", "Bulgarian", "Burkinabe",
            "Burmese", "Burundian", "Cambodian", "Cameroonian", "Canadian", "Cape Verdean", "Central African", "Chadian", "Chilean", 
            "Chinese", "Colombian", "Comoran", "Congolese", "Costa Rican", "Croatian", "Cuban", "Cypriot", "Czech", 
            "Danish", "Djiboutian", "Dominican", "Dutch", "East Timorese", "Ecuadorian", "Egyptian", "Emirati", "Equatorial Guinean",
            "Eritrean", "Estonian", "Ethiopian", "Fijian", "Filipino", "Finnish", "French", "Gabonese", "Gambian",
            "Georgian", "German", "Ghanaian", "Greek", "Grenadian", "Guatemalan", "Guinea-Bissauan", "Guinean", "Guyanese", "Haitian", "Herzegovinian",
            "Honduran", "Hungarian", "Icelander", "Indian", "Indonesian", "Iranian", "Iraqi", "Irish", "Italian", 
            "Ivorian", "Jamaican", "Japanese", "Jordanian", "Kazakhstani", "Kenyan", "Kittian", "Nevisian", 
            "Kuwaiti", "Kyrgyz", "Laotian", "Latvian", "Lebanese", "Liberian", "Libyan", "Liechtensteiner", 
            "Lithuanian", "Luxembourger", "Macedonian", "Malagasy", "Malawian", "Malaysian", "Maldivian", 
            "Malian", "Maltese", "Marshallese", "Mauritanian", "Mauritian", "Mexican", "Micronesian", "Moldovan", 
            "Monacan", "Mongolian", "Moroccan", "Mosotho", "Motswana", "Mozambican", "Namibian", "Nauruan", 
            "Nepalese", "New Zealander", "Ni-Vanuatu", "Nicaraguan", "Nigerien", "North Korean", "Northern Irish", 
            "Norwegian", "Omani", "Pakistani", "Palauan", "Palestinian", "Panamanian", "Papua New Guinean", "Paraguayan",
            "Peruvian", "Polish", "Portuguese", "Qatari", "Romanian", "Russian", "Rwandan", "Saint Lucian", "Salvadoran", "Samoan", "San Marinese", 
            "Sao Tomean", "Saudi", "Scottish", "Senegalese", "Serbian", "Seychellois", "Sierra Leonean", "Singaporean", "Slovak", "Slovenian", "Solomon Islander", 
            "Somali", "South African", "South Korean", "South Sudanese", "Spanish", "Sri Lankan", "Sudanese", "Surinamer", "Swazi", "Swedish", "Swiss", "Syrian", 
            "Taiwanese", "Tajik", "Tanzanian", "Thai", "Togolese", "Tongan", "Trinidadian", "Tunisian", "Turkish", "Tuvaluan", "Ugandan", "Ukrainian", "Uruguayan", "Uzbekistani", 
            "Venezuelan", "Vietnamese", "Vincentian", "Yemeni", "Zambian", "Zimbabwean"],
        required: true,
        trim: true
    },
    dateOfBirth: {
        type: Date,
        required: true,
        immutable: true
    },
    jobOrStudent: {
        type: String,
        required: true,
        trim: true
    },
    wallet: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

touristSchema.pre('save', async function(next) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

touristSchema.statics.login = async function(email,password){
    const tourist = await this.findOne({email});
    if(tourist){
        const auth = await bcrypt.compare(password, tourist.password )
        if(auth){
            return tourist;
        }
        throw Error('Incorrect password');
    }
    throw Error("Email is not registered");
}

const Tourist = mongoose.model('Tourist', touristSchema);
module.exports = Tourist;