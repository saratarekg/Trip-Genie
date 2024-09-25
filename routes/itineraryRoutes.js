const express = require('express');
const router = express.Router();
const itineraryController = require('../controllers/itineraryController.js');

// GET all itineraries (added to tourist)
router.get('/', itineraryController.getAllItineraries);

// GET a single itinerary
router.get('/:id', itineraryController.getItineraryById);

// POST a new itinerary
router.post('/', itineraryController.createItinerary);

// DELETE a single itinerary
router.delete('/:id', itineraryController.deleteItinerary);

// Update a single itinerary
router.patch('/:id', itineraryController.updateItinerary);



module.exports = router;
