const express = require('express');
const tourismGovernorController = require('../controllers/tourismGovernorController');

const router = express.Router();

router.post('/add-tourism-governor', tourismGovernorController.addTourismGovernor);

module.exports = router;