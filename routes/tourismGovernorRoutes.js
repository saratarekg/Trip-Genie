const express = require('express');
const historicalTagController = require('../controllers/historicalTagController');
const historicalPlacesController = require('../controllers/historicalPlacesController');
const router = express.Router();
router.post('/historicalPlacescreate', historicalPlacesController.createHistoricalPlace);
router.get('/historicalPlaces/:id', historicalPlacesController.getHistoricalPlace);
router.get('/historicalPlaces', historicalPlacesController.getAllHistoricalPlaces);
router.delete('/historicalPlaces/:id', historicalPlacesController.deleteHistoricalPlace);
router.put('/historicalPlaces/:id', historicalPlacesController.updateHistoricalPlace);


router.post('/add-historical-tag', historicalTagController.addHistoricalTag);

module.exports = router;