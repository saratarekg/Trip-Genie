const express = require('express');
const touristController = require('../controllers/touristController');
const productController = require('../controllers/productController');
<<<<<<< HEAD
const itineraryController = require('../controllers/itineraryController.js');
const activityController = require('../controllers/activityController.js');
=======
const itineraryController = require('../controllers/itineraryController');
const  historicalPlacesController= require('../controllers/historicalPlacesController');

>>>>>>> 29d782999b315a461f6434d163b0290e38fc90cd

const router = express.Router();

router.get('/', touristController.getTourist);
router.put('/', touristController.updateTourist);
    
router.get('/sort-products-rating', productController.sortProductsByRating);
router.get('/itineraries', itineraryController.getAllItineraries);

router.post('/filterActivities',activityController.filterActivities);

router.get('/getAllProducts', productController.getAllProducts);
router.get('/:name', productController.getProductbyName);

router.get('/filterItinerary',itineraryController.filterItineraries);
router.get('/filterHistoricalPlaces',historicalPlacesController.filterHistoricalPlaces);

module.exports = router;