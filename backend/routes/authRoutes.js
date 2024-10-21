const express = require("express");
const authController = require("../controllers/authController");
const multer = require("multer");
const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // Increase limit to 10MB
});

const router = express.Router();

router.post("/sign-up/tourist", authController.touristSignup);
router.post(
  "/sign-up/advertiser",
  upload.array("documents", 10),
  authController.advertiserSignup
);
router.post("/sign-up/tour-guide", authController.tourGuideSignup);
router.post("/sign-up/seller", authController.sellerSignup);
router.get("/check-unique", authController.checkUnique);
router.get("/logout", authController.logout);
router.post("/login", authController.login);

module.exports = router;
