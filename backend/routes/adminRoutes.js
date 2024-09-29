const express = require('express');
const adminController = require('../controllers/adminController');
const touristController = require('../controllers/touristController');
const sellerController = require('../controllers/sellerController');
const tourGuideController = require('../controllers/tourGuideController');
const advertiserController = require('../controllers/advertiserController');
const tourismGovernorController = require('../controllers/tourismGovernorController');
const tagController = require('../controllers/tagController');
const categoryController = require('../controllers/categoryController');
const productController = require('../controllers/productController');


const router = express.Router();

router.post('/admins', adminController.addAdmin);
router.post('/governors', tourismGovernorController.addTourismGovernor);

// Route to delete an Advertiser
router.delete('/advertisers/:id',advertiserController.deleteAdvertiserAccount);

// Route to delete a Seller
router.delete('/sellers/:id', sellerController.deleteSellerAccount);

// Route to delete a Tour Guide
router.delete('/tour-guides/:id', tourGuideController.deleteTourGuideAccount);


// Route to delete a Tourist
router.delete('/tourists/:id', touristController.deleteTouristAccount);

// Route to delete admin
router.delete('/admins/:id', adminController.deleteAdminAccount);

// Route to delete gov
router.delete('/governors/:id', tourismGovernorController.deleteTourismGovAccount);


router.get('/governors/:id', tourismGovernorController.getTourismGovByID);

router.get('/governors', tourismGovernorController.getAllTourismGov);



router.get('/admins/:id', adminController.getAdminByID);

router.get('/admins', adminController.getAllAdmins);



router.get('/tourists/:id', touristController.getTouristByID);

router.get('/tourists', touristController.getAllTourists);



router.get('/sellers/:id', sellerController.getSellerByID);

router.get('/sellers', sellerController.getAllSellers);



router.get('/tour-guides/:id', tourGuideController.getTourGuideByID);

router.get('/tour-guides', tourGuideController.getAllTourGuides);



router.get('/advertisers/:id', advertiserController.getAdvertiserByID);

router.get('/advertisers', advertiserController.getAllAdvertisers);

router.delete('/tags/:id', tagController.deleteTag);
router.post('/tags', tagController.addTag);
router.get('/tags/:id', tagController.getTag);
router.get('/tags', tagController.getAlltags);
router.put('/tags/:id', tagController.updateTag);



router.post('/categories',categoryController.createCategory);
router.get('/categories/:id', categoryController.getCategory);
router.get('/categories', categoryController.getAllCategories);
router.delete('/categories/:id', categoryController.deleteCategory);
router.put('/categories/:id', categoryController.updateCategory);

router.get('/sort-products-rating', productController.sortProductsByRating);


router.get('/products/filterbyprice', productController.filterProductsByPrice);
router.get('/products', productController.getAllProducts);
router.get('/products/search', productController.searchProductbyName);
router.post('/products', productController.addProduct);

router.put('/products/:id',productController.editProduct);


module.exports = router;