const express = require('express');
const router = express.Router();
const sellerController = require('../controllers/sellerController');

// Get a seller profile by ID
router.get('/:id', sellerController.getSeller);

// Update seller profile
router.put('/:id', sellerController.updateSeller);

module.exports = router;
