const express = require('express');
const adminController = require('../controllers/adminController');
const touristController = require('../controllers/touristController');
const sellerController = require('../controllers/sellerController');
const tourGuideController = require('../controllers/tourGuideController');
const advertiserController = require('../controllers/advertiserController');
const tourismGovernorController = require('../controllers/tourismGovernorController');


const router = express.Router();

router.post('/add-admin', adminController.addAdmin);

// Route to delete an Advertiser
router.delete('/advertiser/:id',advertiserController.adminDeleteAdvertiserAccount);

// Route to delete a Seller
router.delete('/seller/:id', sellerController.adminDeleteSellerAccount);

// Route to delete a Tour Guide
router.delete('/tourguide/:id', tourGuideController.adminDeleteTourGuideAccount);


// Route to delete a Tourist
router.delete('/tourist/:id', touristController.adminDeleteTouristAccount);

// Route to delete admin
router.delete('/delete-admin/:id', adminController.adminDeleteAdminAccount);

// Route to delete gov
router.delete('/delete-gov/:id', tourismGovernorController.adminDeleteTourismGovAccount);


router.get('/governor/:id', tourismGovernorController.AdminGetTourismGovByID);

router.get('/governors', tourismGovernorController.AdminGetAllTourismGov);



router.get('/admin/:id', adminController.AdminGetAdminByID);

router.get('/admins', adminController.AdminGetAllAdmins);



router.get('/tourist/:id', touristController.AdminGetTouristByID);

router.get('/tourists', touristController.AdminGetAllTourists);



router.get('/seller/:id', sellerController.AdminGetSellerByID);

router.get('/sellers', sellerController.AdminGetAllSellers);



router.get('/tour-guide/:id', tourGuideController.AdminGetTourGuideByID);

router.get('/tour-guides', tourGuideController.AdminGetAllTourGuides);



router.get('/advertiser/:id', advertiserController.AdminGetAdvertiserByID);

router.get('/advertisers', advertiserController.AdminGetAllAdvertisers);



module.exports = router;