const mongoose = require('mongoose');
const Tag = require('./tag');
const Category = require('./category');

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
    advertiser: {  // New field for the maker's ID
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Advertiser', // Replace 'User' with the appropriate model name for makers
        required: true, // Assuming it's required, you can set this to false if it's optional
    },
}, {
    timestamps: true,
});

activitySchema.statics.findByAdvertiser = function(advertiserID) {
    return this.find({ 'advertiser': advertiserID }).populate('advertiser').exec();
};

activitySchema.statics.findByFields = async function(searchCriteria) {
    if(searchCriteria === undefined || searchCriteria === null || searchCriteria === "") {
        return this.find().populate('category').populate('tags').populate('advertiser').exec();
    }
    const query = [];
    
    const tags = await Tag.find({type : { $regex: new RegExp(searchCriteria, 'i') }});
    const tagIds = tags.map(tag => tag._id);
    const categories = await Category.find({name : { $regex: new RegExp(searchCriteria, 'i') }});
    const categoryIds = categories.map(category => category._id);

    query.push({["name"] : { $regex: new RegExp(searchCriteria, 'i') }});  // Case-insensitive
    query.push({["location"] : { $regex: new RegExp(searchCriteria, 'i') }});  // Case-insensitive
    
    const cursor = this.find().cursor();

    for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
        for(const tagId of tagIds){
            if(doc.tags.includes(tagId)){
                query.push({ _id: doc._id });
                break;
            }
        }
        for(const categoryId of categoryIds){
            if(doc.category.includes(categoryId)){
                query.push({ _id: doc._id });
                break;
            }
        }
    }

    return this.find({ $or: query }).populate('category').populate('tags').populate('advertiser').exec();  // Perform a search with the regex query
};

activitySchema.statics.findByTagTypes = async function(types) {
    const cursor = this.find().cursor();
    const tagIds = await Tag.find({ type: { $in: types } }).map(tag => tag._id);
    const query = [];

    for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
        for(const tagId of tagIds){
            if(doc.tags.includes(tagId)){
                query.push({ _id: doc._id });
                break;
            }
        }
    }

    return this.find({ $or: query }).populate('category').populate('tags').populate('advertiser').exec();  // Perform a search with the regex query
};


module.exports = mongoose.model('Activity', activitySchema);