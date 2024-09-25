const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/sign-up/tourist', authController.touristSignup);
// router.post('/login/tourist', authController.touristLogin);
router.post('/sign-up/advertiser', authController.advertiserSignup);
// router.post('/login/advertiser', authController.advertiserLogin);
router.post('/sign-up/tour-guide', authController.tourGuideSignup);
// router.post('/login/tour-guide', authController.tourGuideLogin);
router.post('/sign-up/seller', authController.sellerSignup);
// router.post('/login/seller', authController.sellerLogin);
// router.post('/login/admin', authController.adminLogin);
// router.post('/login/tourism-governor', authController.tourismGovernorLogin);
router.get('/logout', authController.logout);
router.post('/login', authController.login);


module.exports = router;