const express = require("express");
const touristController = require("../controllers/touristController");
const productController = require("../controllers/productController");
const itineraryController = require("../controllers/itineraryController.js");
const activityController = require("../controllers/activityController.js");
const activityBookingController = require("../controllers/activityBookingController.js");
const itineraryBookingController = require("../controllers/itineraryBookingController.js");
const historicalPlacesController = require("../controllers/historicalPlacesController");
const tourguideController = require("../controllers/tourGuideController");
const sellerController = require("../controllers/sellerController");
const complaintsController = require("../controllers/complaintsController.js");

const router = express.Router();

router.put("/", touristController.updateTouristProfile);
router.put("/preferences", touristController.updatePreferences);
router.get("/preferences", touristController.getTouristPreferences);

router.get("/", touristController.getTouristProfile);

router.get("/tour-guide/:id", tourguideController.getTourGuideByID);

router.get("/itineraries", itineraryController.getAllItineraries);
router.get("/itineraries/:id", itineraryController.getItineraryById);

router.get("/products", productController.getAllProducts);
router.get("/products/:id", productController.getProductById);

router.get("/seller/:id", sellerController.getSellerByID);

router.get("/activities", activityController.getAllActivities);
router.get("/activities/:id", activityController.getActivityById);

router.post("/activities/rate/:id", activityController.rateActivity);
router.post("/activities/comment/:id", activityController.addCommentToActivity);

router.post("/tourguide/rate/:id", tourguideController.rateTourGuide);
router.post(
  "/tourguide/comment/:id",
  tourguideController.addCommentToTourGuide
);

router.post("/itinerary/rate/:id", itineraryController.rateItinerary);
router.post(
  "/itinerary/comment/:id",
  itineraryController.addCommentToItinerary
);

router.get(
  "/historical-places",
  historicalPlacesController.getAllHistoricalPlaces
);
router.get("/historical-places/:id",historicalPlacesController.getHistoricalPlace);

// router.get("/bookings", bookingController.getUserBookings);
// router.delete("/bookings/:id", bookingController.deleteBooking);
// router.post("/bookings", bookingController.createBooking);

router.get("/activityBooking", activityBookingController.getAllBookings);
router.delete("/activityBooking/:id", activityBookingController.deleteBooking);
router.post("/activityBooking", activityBookingController.createBooking);
router.get('/touristActivityBookings', activityBookingController.getTouristBookings);

router.get("/itineraryBooking", itineraryBookingController.getAllBookings);
router.delete("/irineraryBooking/:id", itineraryBookingController.deleteBooking);
router.post("/itineraryBooking", itineraryBookingController.createBooking);
router.get('/touristItineraryBookings', itineraryBookingController.getTouristBookings);

router.post("/password", touristController.changePassword);
router.post("/complaint", complaintsController.addComplaint);
router.post("/redeem-points", touristController.redeemPoints);

module.exports = router;
