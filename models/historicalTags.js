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


const HistoricalTag = mongoose.model('HistoricalTag', historicalTagSchema);
module.exports = HistoricalTag;

