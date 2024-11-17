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
const purchaseController = require("../controllers/purchaseController.js");
const currencyController = require("../controllers/currencyController");
const transportationController = require("../controllers/transportationController.js");

const router = express.Router();


router.post("/populate", currencyController.getExchangeRate);
router.get("/getCurrency/:id", currencyController.getCurrencyById);
router.get("/currencies", currencyController.getSupportedCurrencies);

// router.get('/fill', currencyController.populateCurrencies);

router.get("/currencies/code", touristController.getCurrencyCode);
router.get("/currencies/idd", touristController.getCurrencyID);
router.post("/currencies/set", touristController.setCurrencyCode);

router.put("/add-card", touristController.addCard);
router.get("/cards", touristController.getAllCards);
router.put("/add-default-card/:id", touristController.changeDefaultCard);
router.delete("/card/:id", touristController.deleteCard);

router.put("/add-shippingAdd", touristController.addShippingAddress);
router.get("/shippingAdds", touristController.getAllShippingAddresses);
router.put(
  "/add-default-shippingAdds/:id",
  touristController.changeDefaultShippingAddress
);
router.put("/update-shippingAdd/:id", touristController.updateShippingAddress);
router.delete("/shippingAdds/:id", touristController.deleteShippingAddress);

router.get(
  "/historical-places-preference",
  historicalPlacesController.filterHistoricalPlacesByPreferences
);
router.get(
  "/historical-places-not-preference",
  historicalPlacesController.theHolyAntiFilter
);

router.put("/", touristController.updateTouristProfile);
router.put("/preferences", touristController.updatePreferences);
router.get("/preferences", touristController.getTouristPreferences);

router.get("/cart", touristController.getCart);
router.delete("/empty/cart", touristController.emptyCart);
router.delete("/remove/cart/:id", touristController.removeItemFromCart);
router.put("/update/cart", touristController.updateCartProductQuantity);

router.get("/wishlist", touristController.getWishlist);
router.delete(
  "/remove/wishlist/:id",
  touristController.removeProductFromWishlist
);
router.delete("/remove/all/wishlist", touristController.removeAllFromWishlist);

router.put("/move/wishlist/:id", touristController.moveProductToCart);
router.put("/move/all/wishlist", touristController.addAllToCart);

router.get("/", touristController.getTouristProfile);

router.get("/tour-guide/:id", tourguideController.getTourGuideByID);

router.get("/itineraries", itineraryController.getAllItineraries);
router.get("/itineraries/:id", itineraryController.getItineraryById);
router.get(
  "/itineraries-preference",
  itineraryController.getItinerariesByPreference
);
router.get(
  "/itineraries-not-preference",
  itineraryController.theHolyAntiFilter
);
router.post(
  "/itineraries/:itineraryId/activities",
  itineraryController.addActivityToItinerary
);
router.put(
  "/itineraries/:itineraryId/activities/:activityId",
  itineraryController.editActivityInItinerary
);
router.delete(
  "/itineraries/:itineraryId/activities/:activityId",
  itineraryController.removeActivityFromItinerary
);
router.get("/myCurrentPurchases", purchaseController.getMyCurrentPurchases);
router.get("/myPastPurchases", purchaseController.getMyPastPurchases);

router.get(
  "/myCurrentActivities",
  activityBookingController.getMyCurrentActivities
);
router.get("/myPastActivities", activityBookingController.getMyPastActivities);

router.get(
  "/myCurrentItineraries",
  itineraryBookingController.getMyCurrentItineraries
);

router.put("/cancelPurchase/:id", purchaseController.cancelPurchase);
router.get("/products", productController.getAllProducts);
router.get("/products/:id", productController.getProductById);

router.get("/seller/:id", sellerController.getSellerByID);

router.get("/max-price-products", productController.getMaxPrice);
router.get("/maxPriceActivities", activityController.getMaxPrice);
router.get("/max-price-itinerary", itineraryController.getMaxPrice);

router.get("/activities", activityController.getAllActivities);
router.get(
  "/activities-preference",
  activityController.getActivitiesByPreferences
);
router.get("/activities-not-preference", activityController.theHolyAntiFilter);

router.get("/activities/:id", activityController.getActivityById);

router.post("/activities/rate/:id", activityController.rateActivity);
router.post("/activities/comment/:id", activityController.addCommentToActivity);
router.put(
  "/activities/updateComment/:id",
  activityController.updateCommentOnActivity
);

router.post("/tourguide/rate/:id", tourguideController.rateTourGuide);
router.post(
  "/tourguide/comment/:id",
  tourguideController.addCommentToTourGuide
);
router.put(
  "/tourguide/updateComment/:id",
  tourguideController.updateCommentOnTourGuide
);

router.post("/itinerary/rate/:id", itineraryController.rateItinerary);
router.post(
  "/itinerary/comment/:id",
  itineraryController.addCommentToItinerary
);
router.put(
  "/itinerary/updateComment/:id",
  itineraryController.updateCommentOnItinerary
);

router.get(
  "/historical-places",
  historicalPlacesController.getAllHistoricalPlaces
);
router.get(
  "/historical-places/:id",
  historicalPlacesController.getHistoricalPlace
);

router.post("/purchase", purchaseController.createPurchase);
router.get("/purchase", purchaseController.getPurchasesByTourist);
router.delete("/purchase/:id", purchaseController.deletePurchase);

router.post("/product/rate/:id", productController.rateProduct);
router.post("/product/comment/:id", productController.addCommentToProduct);
router.put(
  "/product/updateComment/:id",
  productController.updateCommentOnProduct
);
router.post("/product/addToCart", productController.addProductToCart);
router.post(
  "/product/addToWishlist/:id",
  productController.addProductToWishlist
);

router.get("/activityBooking", activityBookingController.getAllBookings);
router.delete("/activityBooking/:id", activityBookingController.deleteBooking);
router.post("/activityBooking", activityBookingController.createBooking);
router.get(
  "/touristActivityBookings",
  activityBookingController.getTouristBookings
);
router.get(
  "/touristActivityAttendedBookings",
  activityBookingController.getTouristAttendedBookings
);
router.put("/activityBooking/:id", activityBookingController.updateBooking);

router.get("/itineraryBooking", itineraryBookingController.getAllBookings);
router.delete(
  "/itineraryBooking/:id",
  itineraryBookingController.deleteBooking
);
router.post("/itineraryBooking", itineraryBookingController.createBooking);
router.get(
  "/touristItineraryBookings",
  itineraryBookingController.getTouristBookings
);
router.get(
  "/touristItineraryAttendedBookings",
  itineraryBookingController.getTouristAttendedItineraries
);

router.post("/password", touristController.changePassword);
router.post("/complaint", complaintsController.addComplaint);
router.post("/redeem-points", touristController.redeemPoints);

router.get("/complaints", complaintsController.getTouristComplaints);
router.delete("/delete-account", touristController.deleteAccount);

router.post("/book-transportation", touristController.bookTransportation);
router.get("/upcoming-transportation", touristController.getUpcomingBookings);
router.get("/history-transportation", touristController.getPreviousBookings);
router.delete("/transportation-booking/:id", touristController.deleteBooking);
router.get(
  "/transportations",
  transportationController.getAllTransportationsNew
);

router.post("/book-flight", touristController.bookFlight);
router.get("/my-flights", touristController.getMyFlights);

router.post("/book-hotel", touristController.bookHotel);
router.get("/my-hotels", touristController.getMyHotels);

router.post("/promo-code", touristController.applyPromoCode);


module.exports = router;
