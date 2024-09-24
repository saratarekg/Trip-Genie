const express = require('express');
const historicalTagController = require('../controllers/historicalTagController');

const router = express.Router();

router.post('/add-historical-tag', historicalTagController.addHistoricalTag);

module.exports = router;