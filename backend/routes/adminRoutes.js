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
const currencyController = require("../controllers/currencyController");
const historicalPlacesController = require("../controllers/historicalPlacesController");
const multer = require("multer");
const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage: storage });

const router = express.Router();

router.get(
  "/historical-places",
  historicalPlacesController.getAllHistoricalPlaces
);
router.get(
  "/historical-places/:id",
  historicalPlacesController.getHistoricalPlace
);

router.get("/max-price-products", productController.getMaxPrice);
router.get("/max-price-products-my", productController.getMaxPriceMy);
router.get(
  "/max-price-products-archived",
  productController.getMaxPriceArchived
);
router.get("/max-price-itinerary", itineraryController.getMaxPrice);

router.post("/populate", currencyController.getExchangeRate);
router.get("/getCurrency/:id", currencyController.getCurrencyById);
router.get("/currencies", currencyController.getSupportedCurrencies);

// router.get('/fill', currencyController.populateCurrencies);

router.get("/currencies/code", touristController.getCurrencyCode);
router.get("/currencies/idd", touristController.getCurrencyID);
router.post("/currencies/set", touristController.setCurrencyCode);

router.post("/admins", adminController.addAdmin);
router.post("/governors", tourismGovernorController.addTourismGovernor);

router.get("/", adminController.getAdminProfile);

// Route to delete an Advertiser
router.delete("/reject/advertisers/:id", advertiserController.rejectAdvertiser);

// Route to delete a Seller
router.delete("/reject/sellers/:id", sellerController.rejectSeller);

// Route to delete a Tour Guide
router.delete("/reject/tourGuides/:id", tourGuideController.rejectTourGuide);

// Route to delete a Tourist
router.delete("/tourists/:id", touristController.deleteTouristAccount);

// Route to delete admin
router.delete("/admins/:id", adminController.deleteAdminAccount);

// Route to delete gov
router.delete(
  "/governors/:id",
  tourismGovernorController.deleteTourismGovAccount
);

// Route to delete a Tour Guide
router.delete("/tourGuides/:id", tourGuideController.deleteTourGuide);

// Route to delete an Advertiser
router.delete("/advertisers/:id", advertiserController.deleteAdvertiser);

// Route to delete a Seller
router.delete("/sellers/:id", sellerController.deleteSeller);

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
router.post(
  "/products",
  upload.array("pictures", 10),
  productController.addProductByAdmin
);
router.get(
  "/products/:id",
  upload.array("pictures", 10),
  productController.getProductById
);
router.get("/productsarchive", productController.getAllProductsArchive);
router.put(
  "/products/:id",
  upload.array("newPictures", 5),
  productController.editProduct
);
router.put("/archiveproducts/:id", productController.archiveProduct);
router.delete("/products/:id", productController.deleteProduct);

router.post("/complaint/:id/reply", complaintsController.replyToComplaint);
router.get("/complaints", complaintsController.getAllComplaints);
router.get("/complaint/:id", complaintsController.getComplaintDetails);

router.put("/complaint/:id/status", complaintsController.markComplaintStatus);

router.put("/itineraries/:id", itineraryController.flagItinerary);
router.get("/itineraries", itineraryController.getAllItinerariesAdmin);
router.get("/itineraries/:id", itineraryController.getItineraryById);
router.post("/password", adminController.changePassword);

router.get("/files", adminController.getAllFiles);
router.get("/files/:filename", adminController.getFile);
router.delete("/files/:filename", adminController.deleteFile);
router.get(
  "/unaccepted-advertiser",
  advertiserController.getUnacceptedAdvertisers
);
router.put("/approve-advertiser/:id", advertiserController.approveAdvertiser);
router.get("/unaccepted-seller", sellerController.getUnacceptedSeller);
router.put("/approve-seller/:id", sellerController.approveSeller);
router.get(
  "/unaccepted-tourguide",
  tourGuideController.getUnacceptedTourGuides
);
router.put("/approve-tourGuide/:id", tourGuideController.approveTourGuide);

router.get("/users-report", adminController.getUsersReport);
router.get("/sales-report", adminController.getSalesReport);
router.get("/itineraries-report", adminController.getItinerariesReport);
router.get("/activities-report", adminController.getActivitiesReport);

module.exports = router;
