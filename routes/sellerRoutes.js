const express = require('express');
const router = express.Router();
const sellerController = require('../controllers/sellerController');
const productController = require('../controllers/productController');

router.put('/', sellerController.updateSeller);

router.get('/', sellerController.getSeller);
router.get('/sort-products-rating', productController.sortProductsByRating);

router.get('/all-products', productController.getAllProducts);
router.get('/:name', productController.getProductbyName);
router.post('/add-product', productController.addProduct);

module.exports = router;