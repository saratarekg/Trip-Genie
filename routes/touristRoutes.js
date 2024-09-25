const express = require('express');
const touristController = require('../controllers/touristController');
const productController = require('../controllers/productController');
const itineraryController = require('../controllers/itineraryController');
const  historicalPlacesController= require('../controllers/historicalPlacesController');


const router = express.Router();

router.get('/', touristController.getTourist);
router.put('/', touristController.updateTourist);
    
router.get('/sort-products-rating', productController.sortProductsByRating);
router.get('/itineraries', itineraryController.getAllItineraries);

router.get('/filterActivities',touristController.filterActivities);


router.get('/filterItinerary',itineraryController.filterItineraries);
router.get('/filterHistoricalPlaces',historicalPlacesController.filterHistoricalPlaces);

module.exports = router;