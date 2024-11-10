const express = require("express");
const router = express.Router();
const nationalityController = require("../controllers/nationalityController");
const tagController = require("../controllers/tagController");
const categoryController = require("../controllers/categoryController");
const historicaltagController = require("../controllers/historicalTagController");
const { getAllLanguages } = require("../controllers/itineraryController");

router.get("/nationalities", nationalityController.getAllNationalities);
router.get("/getAllTypes", tagController.getAllTypes);
router.get("/getAllTags", tagController.getAlltags);
router.get("/getAllCategories", categoryController.getAllCategories);
router.get(
  "/getAllHistoricalTypes",
  historicaltagController.getAllHistoricalTypes
);

router.get("/getAllLanguages", getAllLanguages);

module.exports = router;
