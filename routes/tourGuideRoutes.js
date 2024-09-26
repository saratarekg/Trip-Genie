const express = require('express');
const router = express.Router();
const {
    updateTourGuideProfile,
    getTourGuideProfile
} = require('../controllers/tourGuideController'); // Import the controller functions

const itineraryController = require('../controllers/itineraryController.js');

// Route for getting a single tour guide by ID
router.get('/', getTourGuideProfile);

// Route for updating a tour guide by ID
router.put('/', updateTourGuideProfile);

// Get tour guides specific itinerary list
router.get('/itinerary,', itineraryController.getItinerariesByTourGuide);

// Delete itinerary with certain id
router.delete('/itinerary/:id', itineraryController.deleteItinerary)

// POST a new itinerary
router.post('/itinerary', itineraryController.createItinerary);

// Update a single itinerary
router.put('/itinerary/:id', itineraryController.updateItinerary);

module.exports = router;

