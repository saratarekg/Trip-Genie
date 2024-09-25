const express = require('express');
const router = express.Router();
const sellerController = require('../controllers/sellerController');

router.put('/', sellerController.updateSeller);

router.get('/', sellerController.getSeller);

module.exports = router;