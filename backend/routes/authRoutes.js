const express = require("express");
const authController = require("../controllers/authController");

const router = express.Router();

router.post("/sign-up/tourist", authController.touristSignup);
router.post("/sign-up/advertiser", authController.advertiserSignup);
router.post("/sign-up/tour-guide", authController.tourGuideSignup);
router.post("/sign-up/seller", authController.sellerSignup);
router.get("/check-unique", authController.checkUnique);
router.get("/logout", authController.logout);
router.post("/login", authController.login);

module.exports = router;
