const express = require('express');
const touristController = require('../controllers/touristController');
const productController = require('../controllers/productController');
const itineraryController = require('../controllers/itineraryController.js');
const activityController = require('../controllers/activityController.js');

const router = express.Router();

router.get('/', touristController.getTourist);
router.put('/', touristController.updateTourist);
    
router.get('/sort-products-rating', productController.sortProductsByRating);
router.get('/itineraries', itineraryController.getAllItineraries);

router.post('/filterActivities',activityController.filterActivities);


router.get('/filterItinerary',itineraryController.filterItineraries);
module.exports = router;