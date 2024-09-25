const express = require('express');
const touristController = require('../controllers/touristController');

const router = express.Router();

router.get('/', touristController.getTourist);

router.put('/', touristController.updateTourist);

router.get('/filterActivitiess',touristController.filterActivities);
module.exports = router;