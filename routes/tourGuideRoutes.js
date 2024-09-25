const express = require('express');
const router = express.Router();
const {
    updateTourGuideProfile,
    getTourGuideProfile,
    getItinerariesByTourGuide,
    deleteItinerary
} = require('../controllers/tourGuideController'); // Import the controller functions

const itineraryController = require('../controllers/itineraryController.js');

// Route for getting a single tour guide by ID
router.get('/myProfile', getTourGuideProfile);

// Route for updating a tour guide by ID
router.put('/updateMyProfile', updateTourGuideProfile);

// Get tour guides specific itinerary list
router.get('/allIteneraries,',getItinerariesByTourGuide);

// Delete itinerary with certain id
router.delete('/deleteItinerary/:id', deleteItinerary)

// POST a new itinerary
router.post('/createItinerary', itineraryController.createItinerary);

// Update a single itinerary
router.put('/updateItinerary/:id', itineraryController.updateItinerary);

module.exports = router;

