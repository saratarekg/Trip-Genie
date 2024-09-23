const express = require('express');
const router = express.Router();
const sellerController = require('../controllers/sellerController');

router.get('/', sellerController.getAllSellers);

// Get a seller profile by ID
router.get('/:id', sellerController.getSellerByID);

// Update seller profile
router.put('/:id', sellerController.updateSeller);

module.exports = router;