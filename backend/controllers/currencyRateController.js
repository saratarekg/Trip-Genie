const axios = require('axios');
const CurrencyRates = require('../models/currencyRate'); 

const API_KEY = process.env.API_KEY;
const BASE_URL = 'https://v6.exchangerate-api.com/v6';

const updateRatesAgainstUSD = async () => {
    try {
        // Check if the rates exist and if they were updated today
        const existingRates = await CurrencyRates.findOne();

        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize to midnight

        if (!existingRates || existingRates.lastUpdated < today) {
            console.log('Fetching new exchange rates...');

            // Fetch new rates from the API
            const response = await axios.get(`${BASE_URL}/${API_KEY}/latest/USD`);
            const { conversion_rates } = response.data;

            // Clear existing rates if present
            if (existingRates) {
                await CurrencyRates.deleteMany({});
            }

            // Save new rates and update the lastUpdated date
            const newRates = new CurrencyRates({
                rates: conversion_rates,
                lastUpdated: new Date(),
            });

            await newRates.save();
            console.log('Exchange rates updated successfully.');
        } else {
            console.log('Exchange rates are already up-to-date.');
        }
    } catch (error) {
        console.error('Error updating exchange rates:', error);
    }
};

module.exports = { updateRatesAgainstUSD };
