const express = require("express");
const activityController = require("../controllers/activityController");
const advertiserController = require("../controllers/advertiserController");
const currencyController = require("../controllers/currencyController");
const multer = require("multer");
const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage: storage });

const router = express.Router();

router.get("/getCurrency/:id", currencyController.getCurrencyById);
router.get("/currencies", currencyController.getSupportedCurrencies);

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

router.get("/", advertiserController.getAdvertiser);
router.put("/", upload.single("logo"), advertiserController.updateAdvertiser);

router.get("/advertisers/:id", advertiserController.getAdvertiserByID);
router.post("/password", advertiserController.changePassword);
router.post("/delete-account", advertiserController.deleteAdvertiserAccount);
module.exports = router;
