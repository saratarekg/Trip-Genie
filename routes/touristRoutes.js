const express = require('express');
const touristConroller = require('../controllers/touristController');
const productController = require('../controllers/productController');

const router = express.Router();

router.get('/', touristConroller.getTourist);

router.put('/', touristConroller.updateTourist);
router.get('/sort-products-rating', productController.sortProductsByRating);
module.exports = router;