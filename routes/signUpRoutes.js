const express = require('express');
const touristController = require('../controllers/touristController');
const advertiserController = require('../controllers/advertiserController');
const tourGuideController = require('../controllers/tourGuideController');
const sellerController = require('../controllers/sellerController');

const router = express.Router();

router.post('/tourist', touristController.touristSignup);
router.post('/service-provider', (req, res) => {
    if (req.body.role === 'advertiser') {
        advertiserController.advertiserSignup(req, res);
    } else if (req.body.role === 'tour-guide') {
        tourGuideController.tourGuideSignup(req, res);
    } else if (req.body.role === 'seller') {
        console.log("tmam");
        sellerController.sellerSignup(req, res);
        console.log("hdhbheh")
    }
    else{
        res.status(400).json({ message: 'Invalid role' });
    }
});

module.exports = router;