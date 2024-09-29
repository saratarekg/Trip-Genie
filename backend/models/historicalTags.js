const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const historicalTagSchema = new Schema({
    type: {
        type: String,
        required: true,

    },
    period: {
        type: String,
        required: true,
    }
 
  

}, { timestamps: true });

historicalTagSchema.statics.findByType = function(type) {
    return this.find({ type }).exec();
}

historicalTagSchema.statics.findByPeriod = function(period) {
    return this.find({ period }).exec();
}

historicalTagSchema.statics.filterByFields = async function(searchFields) {
    const { type, period } = searchFields;
    const query = {};

    // Convert the fields to case-insensitive regex search
    for (let key in { type, period }) {
        query[key] = { $regex: new RegExp(searchFields[key], 'i') };  // Case-insensitive
    }

    return this.find(query);  // Perform a search with the regex query
}

historicalTagSchema.statics.searchByFields = async function(searchFields) {
    const query = [];

    query.push({ ["type"]: { $regex: new RegExp(searchFields, 'i') } });
    query.push({ ["period"]: { $regex: new RegExp(searchFields, 'i') } });
    return this.find({ $or: query });  // Perform a search with the regex query
}

const HistoricalTag = mongoose.model('HistoricalTag', historicalTagSchema);
module.exports = HistoricalTag;

