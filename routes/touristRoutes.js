const express = require('express');
const touristConroller = require('../controllers/touristController');
const productController = require('../controllers/productController');
const itineraryController = require('../controllers/itineraryController.js');

const router = express.Router();

router.get('/', touristController.getTourist);

router.put('/', touristConroller.updateTourist);
router.get('/sort-products-rating', productController.sortProductsByRating);
router.get('/itineraries', itineraryController.getAllItineraries);

router.get('/filterActivitiess',touristController.filterActivities);
router.get('/getMyActivities',touristController.getActivitiesByTourist);
module.exports = router;