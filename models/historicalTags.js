const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const historicalTagSchema = new Schema({
    type: {
        type: String,
        required: true,
        enum: ["Monuments", "Museums", "Religious Sites", "Palaces/Castles"]

    },
    period: {
        type: String,
        required: true,
    }
 
  

}, { timestamps: true });


const HistoricalTag = mongoose.model('HistoricalTag', historicalTagSchema);
module.exports = HistoricalTag;