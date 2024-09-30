const express = require('express');
const router = express.Router();
const sellerController = require('../controllers/sellerController');
const productController = require('../controllers/productController');

router.put('/', sellerController.updateSeller);
router.get('/', sellerController.getSeller);

router.get('/products/sort', productController.sortProductsByRating);
router.get('/products/filter', productController.filterProductsByPrice);
router.get('/products', productController.getAllProducts);
router.get('/products/search', productController.searchProductbyName);
router.post('/products', productController.addProduct);
router.delete('/products/:id', productController.deleteProductOfSeller);
router.put('/products/:id',productController.editProductOfSeller);



module.exports = router;