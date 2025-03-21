const express = require("express");
const activityController = require("../controllers/activityController");
const advertiserController = require("../controllers/advertiserController");
const currencyController = require("../controllers/currencyController");
const multer = require("multer");
const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage: storage });

const transportationController = require("../controllers/transportationController");
const activityBookingController = require("../controllers/activityBookingController");

const router = express.Router();

router.get("/getCurrency/:id", currencyController.getCurrencyById);
router.get("/currencies", currencyController.getSupportedCurrencies);

// Routes for Advertiser Notifications
router.get("/notifications", advertiserController.getAdvertiserNotifications);
router.get("/unseen-notifications", advertiserController.hasUnseenNotifications);
router.post('/mark-notifications-seen', advertiserController.markNotificationsAsSeen);
router.post('/notifications/markAsSeen/:id', advertiserController.markNotificationAsSeenForAdvertiser);
router.post("/mark-dropdown-opened", advertiserController.markDropdownAsOpened); // Mark dropdown opened route

router.post(
  "/activities",
  upload.array("pictures", 10),
  activityController.createActivity
);
router.get("/activities", activityController.getAllActivities);
router.get("/activities/:id", activityController.getActivityById);
router.put(
  "/activities/:id",
  upload.array("newPictures", 10),
  activityController.updateActivity
);
router.delete("/activities/:id", activityController.deleteActivity);
router.get("/maxPriceActivities", activityController.getMaxPrice);
router.get("/max-price-activities-my", activityController.getMaxPriceMy);

router.get("/", advertiserController.getAdvertiser);
router.put("/", upload.single("logo"), advertiserController.updateAdvertiser);

router.get("/advertisers/:id", advertiserController.getAdvertiserByID);
router.post("/password", advertiserController.changePassword);
router.delete("/delete-account", advertiserController.deleteAdvertiserAccount);

// crud transportation
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

router.get("/activities-report", activityBookingController.getBookingsReport);

module.exports = router;
