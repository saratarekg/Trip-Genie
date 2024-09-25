const express = require('express');
const router = express.Router();
const sellerController = require('../controllers/sellerController');
const productController = require('../controllers/productController');

router.put('/', sellerController.updateSeller);

router.get('/', sellerController.getSeller);
router.get('/sort-products-rating', productController.sortProductsByRating);
module.exports = router;