const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/sign-up/tourist', authController.touristSignup);
router.post('/login/tourist', authController.touristLogin);


module.exports = router;