const mongoose = require('mongoose');

const currencyRateSchema = new mongoose.Schema({
    rates: {
        type: Map,
        of: Number,
        required: true,
    },
    lastUpdated: {
        type: Date,
        required: true,
    }
});

const CurrencyRates = mongoose.model('CurrencyRates', currencyRateSchema);

module.exports = CurrencyRates;
