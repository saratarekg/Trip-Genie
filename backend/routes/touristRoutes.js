const express = require("express");
const touristController = require("../controllers/touristController");
const productController = require("../controllers/productController");
const itineraryController = require("../controllers/itineraryController.js");
const activityController = require("../controllers/activityController.js");
const bookingController = require("../controllers/bookingController.js");
const historicalPlacesController = require("../controllers/historicalPlacesController");

const router = express.Router();



router.get("/itineraries/sort",itineraryController.sortItineraries);
router.get("/itineraries/search", itineraryController.searchItineraries);
router.get("/itineraries", itineraryController.getAllItineraries);
router.get("/itineraries/:id", itineraryController.getItineraryById);
router.get("/itineraries/filter", itineraryController.filterItineraries);

router.get('/products/filter', productController.filterProductsByPrice);
router.get('/products', productController.getAllProducts);
router.get('/products/:id', productController.getProductById);
router.get('/products/search', productController.searchProductbyName);
router.get("/products/sort", productController.sortProductsByRating);

router.get("/activities/filter", activityController.filterActivities);
router.get("/activities", activityController.getAllActivities);
router.get("/activities/:id", activityController.getActivityById);
router.get("/activities/sort", activityController.sortActivities);
router.get("/activities/search", activityController.searchActivities);


router.get("/historical-places",historicalPlacesController.getAllHistoricalPlaces);
router.get("/historical-places/:id",historicalPlacesController.getHistoricalPlace);
router.get("/historical-places/filter",historicalPlacesController.filterHistoricalPlaces);
router.get("/historical-places/search",historicalPlacesController.searchHistoricalPlaces);

router.get("/bookings", bookingController.getUserBookings);
router.delete("/bookings/:id", bookingController.deleteBooking);
router.post("/bookings", bookingController.createBooking);



module.exports = router;
