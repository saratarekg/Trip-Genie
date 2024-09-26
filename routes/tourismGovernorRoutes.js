const express = require('express');
const historicalTagController = require('../controllers/historicalTagController');
const historicalPlacesController = require('../controllers/historicalPlacesController');
const tourismGovernorController = require('../controllers/tourismGovernorController');
const router = express.Router();
router.post('/add-historical-places', historicalPlacesController.createHistoricalPlace);
router.get('/historical-places/:id', historicalPlacesController.getHistoricalPlace);
router.get('/historical-places', historicalPlacesController.getAllHistoricalPlaces);
router.delete('/historical-places/:id', historicalPlacesController.deleteHistoricalPlace);
router.put('/historical-places/:id', historicalPlacesController.updateHistoricalPlace);

router.post('/add-historical-tag', historicalTagController.addHistoricalTag);

router.get('/historical-places-by-governor', tourismGovernorController.getHistoricalPlacesByGovernor);


module.exports = router;