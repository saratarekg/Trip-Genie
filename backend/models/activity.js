const mongoose = require('mongoose');
const Tag = require('./tag');
const Category = require('./category');

const Schema = mongoose.Schema;

const activitySchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
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
    timing: {
        type: Date,
        required: true
    },
    price: {
        type: Number,
        required: true,
    },
    range: {
        type: Number,
        required: false,
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
    pictures: {
        type: [String],
        default: "/src/assets/images/defaultImages.png"
    },
    advertiser: {  // New field for the maker's ID
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Advertiser', // Replace 'User' with the appropriate model name for makers
        required: true, // Assuming it's required, you can set this to false if it's optional
    },
}, {
    timestamps: true,
});

activitySchema.statics.findByAdvertiser = function (advertiserID) {
    return this.find({ 'advertiser': advertiserID }).populate('advertiser').exec();
};

activitySchema.statics.findByFields = async function (searchCriteria) {
    if (searchCriteria === undefined || searchCriteria === null || searchCriteria === "") {
        return this.find().populate('category').populate('tags').populate('advertiser').exec();
    }
    const query = [];

    const tags = await Tag.find({ type: { $regex: new RegExp(searchCriteria, 'i') } });
    const tagIds = tags.map(tag => tag._id);

    const categories = await Category.find({ name: { $regex: new RegExp(searchCriteria, 'i') } });
    const categoryIds = categories.map(category => category._id);

    query.push({ ["name"]: { $regex: new RegExp(searchCriteria, 'i') } });  // Case-insensitive
    query.push({ ["location"]: { $regex: new RegExp(searchCriteria, 'i') } });  // Case-insensitive
    query.push({ ["description"]: { $regex: new RegExp(searchCriteria, 'i') } });  // Case-insensitive

    const cursor = this.find().cursor();


    for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
        for (const tagId of tagIds) {
            if (doc.tags && doc.tags.includes(tagId)) {
                query.push({ _id: doc._id });
                break;
            }
        }
        for (const categoryId of categoryIds) {
            if (doc.category && doc.category.includes(categoryId)) {
                query.push({ _id: doc._id });
                break;
            }
        }

    }


    return this.find({ $or: query }).populate('category').populate('tags').populate('advertiser').exec();  // Perform a search with the regex query
};

// activitySchema.statics.findByTagTypes = async function (types) {
//     if (types.length === 0) {
//         return this.find().populate('category').populate('tags').populate('advertiser').exec();  // Perform a search with the regex query
//     }


//     const cursor = this.find().cursor();
//     const tags = await Tag.find({ type: { $in: types } });
//     const tagIds = tags.map(tag => tag._id);
//     const query = [];

//     for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
//         for (const tagId of tagIds) {
//             if (doc.tags.includes(tagId)) {
//                 query.push({ _id: doc._id });
//                 break;
//             }
//         }
//     }
//     console.log(query);

//     if (query.length === 0)
//         return [];

// console.log(query);
//     return this.find({ $or: query }).populate('category').populate('tags').populate('advertiser').exec();  // Perform a search with the regex query
// };

activitySchema.statics.findByTagTypes = async function (types) {
    if (typeof types === 'string') {
        types = types.split(',');
    }


    if (types.length === 0) {
        return this.find().populate('category').populate('tags').populate('advertiser').exec();
    }

    const tags = await Tag.find({ type: { $in: types } });
    const tagIds = tags.map(tag => tag._id);


    if (tagIds.length === 0) {
        return [];
    }

    return this.find({ tags: { $in: tagIds } })
        .populate('category')
        .populate('tags')
        .populate('advertiser')
        .exec();
};


activitySchema.statics.findByCategoryNames = async function (names) {
    if (names.length === 0) {
        return this.find().populate('category').populate('tags').populate('advertiser').exec();  // Perform a search with the regex query
    }



    const cursor = this.find().cursor();
    const categories = await Category.find({ name: { $in: names } });
    const categoryIds = categories.map(category => category._id.toString());
    console.log(categoryIds);
    const query = [];

    for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
        for (const categoryId of categoryIds) {
            if (doc.category.includes(categoryId.toString())) {
                query.push({ _id: doc._id });
                break;
            }
        }
    }
    if (query.length === 0) {
        return [];
    }

    return this.find({ $or: query }).populate('category').populate('tags').populate('advertiser').exec();  // Perform a search with the regex query
};

activitySchema.statics.filter = async function (price, startDate, endDate, category, minRating) {
    const query = [];

    if (price !== undefined && price !== null && price !== "") {
        query.push({ ["price"]: { $lte: price } });
    }
    if (startDate !== undefined && startDate !== null && startDate !== "") {
        query.push({ ["timing"]: { $gte: startDate } });
    }
    if (endDate !== undefined && endDate !== null && endDate !== "") {
        query.push({ ["timing"]: { $lte: endDate } });
    }

    if (category) {
        // Find the category by name and get its ObjectId
        const activityList = await Activity.findByCategoryNames(category);
        const activityIds = activityList.map((activity) => activity._id);
        query.push({ ["_id"]: { $in: activityIds } });
    }

    if (minRating !== undefined && minRating !== null && minRating !== "") {
        query.push({ ["rating"]: { $gte: minRating } });
    }
    if (query.length === 0) {
        return this.find().populate('category tags advertiser').exec();

    }
    return this.find({ $and: query }).populate('category tags advertiser').exec();

}


module.exports = mongoose.model('Activity', activitySchema);