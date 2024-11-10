const express = require("express");
const router = express.Router();
const {
  updateTourGuideProfile,
  getTourGuideProfile,
  addCommentToTourGuide,
  rateTourGuide,
  deleteTourGuideAccount,
  changePassword,
  getTourGuideByID,
} = require("../controllers/tourGuideController"); // Import the controller functions
const multer = require("multer");
const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage: storage });

const itineraryController = require("../controllers/itineraryController.js");
const activityController = require("../controllers/activityController.js");
const currencyController = require("../controllers/currencyController");

const transportationController = require("../controllers/transportationController");
// Route for getting a single tour guide by ID
router.get("/", getTourGuideProfile);

router.get("/getCurrency/:id", currencyController.getCurrencyById);
router.get("/maxPriceActivities", activityController.getMaxPrice);
router.get("/currencies", currencyController.getSupportedCurrencies);

router.get("/max-price-itinerary", itineraryController.getMaxPrice);
router.get("/max-price-itinerary-my", itineraryController.getMaxPriceMy);

// Route for updating a tour guide by ID
router.put("/", upload.single("profilePicture"), updateTourGuideProfile);
router.get("/tour-guide/:id", getTourGuideByID);
router.delete("/delete-account", deleteTourGuideAccount);
router.get("/itineraries", itineraryController.getAllItineraries);
router.post("/itineraries", upload.any(), itineraryController.createItinerary);
router.put(
  "/itineraries/:id",
  upload.any(),
  itineraryController.updateItinerary
);
router.delete("/itineraries/:id", itineraryController.deleteItinerary);
router.get("/itineraries/:id", itineraryController.getItineraryById);

router.get("/activities", activityController.getAllActivities);
router.get("/activities/:id", activityController.getActivityById);
router.put("/activities/:id", activityController.updateActivity);

router.put(
  "/itineraries-activation/:id",
  itineraryController.toggleActivationStatus
);

router.post("/password", changePassword);

// transportation crud
router.get("/transportations", transportationController.getAllTransportations);
router.get(
  "/transportations/:id",
  transportationController.getTransportationById
);
router.post("/transportations", transportationController.createTransportation);
router.put(
  "/transportations/:id",
  transportationController.updateTransportation
);
router.delete(
  "/transportations/:id",
  transportationController.deleteTransportation
);

module.exports = router;
