const express = require('express');
const router = express.Router();
const sellerController = require('../controllers/sellerController');
const {checkSeller} = require('../middlewares/authMiddleware');

router.get('*', checkSeller);
router.get('/', sellerController.getAllSellers);

// Get a seller profile by ID
router.get('/:id', sellerController.getSellerByID);

// Update seller profile
router.put('/:id', sellerController.updateSeller);

module.exports = router;