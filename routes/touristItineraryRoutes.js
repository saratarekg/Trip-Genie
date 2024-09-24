const express = require('express');
const router = express.Router();
const touristItineraryController = require('../controllers/touristItineraryController'); 

// GET all itineraries
router.get('/', touristItineraryController.getAllItineraries);

// GET a single itinerary
router.get('/:id', touristItineraryController.getItineraryById);

// POST a new itinerary
router.post('/', touristItineraryController.createItinerary);

// DELETE a single itinerary
router.delete('/:id', touristItineraryController.deleteItinerary);

// Update a single itinerary
router.patch('/:id', touristItineraryController.updateItinerary);

module.exports = router;
