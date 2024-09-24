const express = require('express');
const adminController = require('../controllers/adminController');
const touristController = require('../controllers/touristController');
const sellerController = require('../controllers/sellerController');
const tourGuideController = require('../controllers/tourGuideController');
const advertiserController = require('../controllers/advertiserController');
const tourismGovernorController = require('../controllers/tourismGovernorController');
const tagController = require('../controllers/tagController');

const router = express.Router();

router.post('/add-admin', adminController.addAdmin);
router.post('/add-tourism-governor', tourismGovernorController.addTourismGovernor);

// Route to delete an Advertiser
router.delete('/advertiser/:id',advertiserController.deleteAdvertiserAccount);

// Route to delete a Seller
router.delete('/seller/:id', sellerController.deleteSellerAccount);

// Route to delete a Tour Guide
router.delete('/tourguide/:id', tourGuideController.deleteTourGuideAccount);


// Route to delete a Tourist
router.delete('/tourist/:id', touristController.deleteTouristAccount);

// Route to delete admin
router.delete('/delete-admin/:id', adminController.deleteAdminAccount);

// Route to delete gov
router.delete('/delete-gov/:id', tourismGovernorController.deleteTourismGovAccount);


router.get('/governor/:id', tourismGovernorController.getTourismGovByID);

router.get('/governors', tourismGovernorController.getAllTourismGov);



router.get('/admin/:id', adminController.getAdminByID);

router.get('/admins', adminController.getAllAdmins);



router.get('/tourist/:id', touristController.getTouristByID);

router.get('/tourists', touristController.getAllTourists);



router.get('/seller/:id', sellerController.getSellerByID);

router.get('/sellers', sellerController.getAllSellers);



router.get('/tour-guide/:id', tourGuideController.getTourGuideByID);

router.get('/tour-guides', tourGuideController.getAllTourGuides);



router.get('/advertiser/:id', advertiserController.getAdvertiserByID);

router.get('/advertisers', advertiserController.getAllAdvertisers);

router.delete('/tag/:id', tagController.deleteTag);
router.post('/add-tag', tagController.addTag);
router.get('/tag/:id', tagController.getTag);
router.get('/tag', tagController.getAlltags);
router.put('/tag/:id', tagController.updateTag);


module.exports = router;