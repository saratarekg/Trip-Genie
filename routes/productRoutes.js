const express = require('express');
const productController = require('../controllers/productController');

const router = express.Router();


router.get('/getAllProducts', productController.getAllProducts);
router.get('/:name', productController.getProductbyName);
router.post('/addProduct', productController.addProduct);

module.exports = router;
