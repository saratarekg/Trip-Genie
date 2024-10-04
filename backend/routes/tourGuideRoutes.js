const express = require('express');
const router = express.Router();
const {
    updateTourGuideProfile,
    getTourGuideProfile,
    deleteItinerary
} = require('../controllers/tourGuideController'); // Import the controller functions

const itineraryController = require('../controllers/itineraryController.js');
const activityController = require('../controllers/activityController.js')

// Route for getting a single tour guide by ID
router.get('/', getTourGuideProfile);
// Route for updating a tour guide by ID
router.put('/', updateTourGuideProfile);
router.get('/itineraries',itineraryController.getItinerariesByTourGuide);
router.post('/itineraries', itineraryController.createItinerary);
router.put('/itineraries/:id', itineraryController.updateItinerary);
router.delete('/itineraries/:id', itineraryController.deleteItinerary)
router.get('/itineraries/:id',itineraryController.getItineraryById);
router.get('/activity', activityController.getAllActivities);



module.exports = router;

