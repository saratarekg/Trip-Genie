const express = require("express");
const tourguideController = require("../controllers/tourGuideController");
const touristController = require("../controllers/touristController");
const productController = require("../controllers/productController");
const itineraryController = require("../controllers/itineraryController.js");
const activityController = require("../controllers/activityController.js");
const historicalPlacesController = require("../controllers/historicalPlacesController");
const sellerController = require("../controllers/sellerController");
const currencyController = require('../controllers/currencyController');

const router = express.Router();

router.get('/getCurrency/:id', currencyController.getCurrencyById);

router.get("/itineraries", itineraryController.getAllItineraries);
router.get("/itineraries/:id", itineraryController.getItineraryById);
router.get("/tour-guide/:id", tourguideController.getTourGuideByID);

router.get("/products", productController.getAllProducts);
router.get("/products/:id", productController.getProductById);

router.get("/activities", activityController.getAllActivities);
router.get("/activities/:id", activityController.getActivityById);
router.get("/maxPriceActivities", activityController.getMaxPrice);

router.get(
  "/historical-places",
  historicalPlacesController.getAllHistoricalPlaces
);
router.get(
  "/historical-places/:id",
  historicalPlacesController.getHistoricalPlace
);

module.exports = router;
