const express = require("express");
const adminController = require("../controllers/adminController");
const touristController = require("../controllers/touristController");
const sellerController = require("../controllers/sellerController");
const tourGuideController = require("../controllers/tourGuideController");
const advertiserController = require("../controllers/advertiserController");
const tourismGovernorController = require("../controllers/tourismGovernorController");
const tagController = require("../controllers/tagController");
const categoryController = require("../controllers/categoryController");
const productController = require("../controllers/productController");
const historicalTagController = require("../controllers/historicalTagController");
const complaintsController = require("../controllers/complaintsController.js");
const itineraryController = require("../controllers/itineraryController.js");

const router = express.Router();

router.post("/admins", adminController.addAdmin);
router.post("/governors", tourismGovernorController.addTourismGovernor);

// Route to delete an Advertiser
router.delete("/advertisers/:id", advertiserController.deleteAdvertiserAccount);

// Route to delete a Seller
router.delete("/sellers/:id", sellerController.deleteSellerAccount);

// Route to delete a Tour Guide
router.delete("/tourGuides/:id", tourGuideController.deleteTourGuideAccount);

// Route to delete a Tourist
router.delete("/tourists/:id", touristController.deleteTouristAccount);

// Route to delete admin
router.delete("/admins/:id", adminController.deleteAdminAccount);

// Route to delete gov
router.delete(
  "/governors/:id",
  tourismGovernorController.deleteTourismGovAccount
);

router.get("/governors/:id", tourismGovernorController.getTourismGovByID);

router.get("/governors", tourismGovernorController.getAllTourismGov);

router.get("/admins/:id", adminController.getAdminByID);

router.get("/admins", adminController.getAllAdmins);

router.get("/tourists/:id", touristController.getTouristByID);

router.get("/tourists", touristController.getAllTourists);

router.get("/seller/:id", sellerController.getSellerByID);

router.get("/sellers", sellerController.getAllSellers);

router.get("/tour-guides/:id", tourGuideController.getTourGuideByID);

router.get("/tour-guides", tourGuideController.getAllTourGuides);

router.get("/advertisers/:id", advertiserController.getAdvertiserByID);

router.get("/advertisers", advertiserController.getAllAdvertisers);

router.get("/users", adminController.getAllUsers);
router.get("/userbyrole", adminController.getUsersByRoles);

router.delete("/tags/:id", tagController.deleteTag);
router.post("/tags", tagController.addTag);
router.get("/tags/:id", tagController.getTag);
router.get("/tags", tagController.getAlltags);
router.get("/tagbytype", tagController.getTagbyType);
router.put("/tags/:id", tagController.updateTag);

router.delete("/historical-tags/:id", historicalTagController.deleteTag);
router.get("/historical-tags", historicalTagController.getAlltags);

router.get("/categoriesName", categoryController.getCategoriesByName);
router.post("/categories", categoryController.createCategory);
router.get("/categories", categoryController.getAllCategories);
router.get("/categories/:id", categoryController.getCategory);
router.delete("/categories/:id", categoryController.deleteCategory);
router.put("/categories/:id", categoryController.updateCategory);

router.get("/products", productController.getAllProducts);
router.post("/products", productController.addProductByAdmin);
router.get("/products/:id", productController.getProductById);
router.put("/products/:id", productController.editProduct);
router.delete("/products/:id", productController.deleteProduct);

router.get("/complaint", complaintsController.getAllComplaints);
router.put("/itineraries/:id", itineraryController.flagItinerary);
router.get("/itineraries", itineraryController.getAllItineraries);
router.get("/itineraries/:id", itineraryController.getItineraryById);
router.post("/password", adminController.changePassword);


module.exports = router;
