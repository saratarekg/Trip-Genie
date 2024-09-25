const express = require('express');
const touristConroller = require('../controllers/touristController');

const router = express.Router();

router.get('/', touristConroller.getTourist);

router.put('/', touristConroller.updateTourist);

module.exports = router;