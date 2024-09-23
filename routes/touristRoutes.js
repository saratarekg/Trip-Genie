const express = require('express');
const touristController = require('../controllers/touristController');

const router = express.Router();

router.post('/sign-up', touristController.touristSignup);

module.exports = router;