const express = require("express");
const activityController = require("../controllers/activityController");
const advertiserController = require("../controllers/advertiserController");

const router = express.Router();

router.post("/activities", activityController.createActivity);
router.get("/activities", activityController.getAllActivities);
router.get("/activities/:id", activityController.getActivityById);
router.put("/activities/:id", activityController.updateActivity);
router.delete("/activities/:id", activityController.deleteActivity);

router.get("/", advertiserController.getAdvertiser);
router.put("/", advertiserController.updateAdvertiser);

router.get("/advertisers/:id", advertiserController.getAdvertiserByID);
router.post("/password", advertiserController.changePassword);

module.exports = router;
