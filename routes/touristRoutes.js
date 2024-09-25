const express = require('express');
const touristConroller = require('../controllers/touristController');
const itineraryController = require('../controllers/itineraryController.js');

const router = express.Router();

router.get('/', touristConroller.getTourist);

router.put('/', touristConroller.updateTourist);

router.get('/itineraries', itineraryController.getAllItineraries);

module.exports = router;