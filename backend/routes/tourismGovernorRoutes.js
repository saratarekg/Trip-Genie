const express = require("express");
const historicalTagController = require("../controllers/historicalTagController");
const historicalPlacesController = require("../controllers/historicalPlacesController");
const tourismGovernorController = require("../controllers/tourismGovernorController");
const router = express.Router();
router.post(
  "/historical-places",
  historicalPlacesController.createHistoricalPlace
);
router.get(
  "/historical-places",
  historicalPlacesController.getAllHistoricalPlaces
);
router.get(
  "/historical-places/:id",
  historicalPlacesController.getHistoricalPlace
);
router.delete(
  "/historical-places/:id",
  historicalPlacesController.deleteHistoricalPlace
);
router.put(
  "/historical-places/:id",
  historicalPlacesController.updateHistoricalPlace
);

router.post("/historical-tag", historicalTagController.addHistoricalTag);
router.get("/historical-tag", historicalTagController.getAlltags);
router.put("/historical-tag/:id", historicalTagController.updateHistoricalTag);
router.delete("/historical-tag/:id", historicalTagController.deleteTag);

router.get(
  "/my-historical-places",
  historicalPlacesController.getHistoricalPlacesByGovernor
);
router.post("password", tourismGovernorController.changePassword);
module.exports = router;
