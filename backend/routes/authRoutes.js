const express = require("express");
const authController = require("../controllers/authController");
const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");
const crypto = require("crypto");
const path = require("path");

const router = express.Router();

// Create storage engine
const storage = new GridFsStorage({
  url: process.env.URI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString("hex") + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: "uploads",
          metadata: {
            // userRole: req.body.userRole,
            documentType: file.fieldname,
          },
        };
        resolve(fileInfo);
      });
    });
  },
});

const upload = multer({ storage });

advertiserSellerFileFields = [
  { name: "ID", maxCount: 1 },
  { name: "Taxation Registry Card", maxCount: 1 },
];
tourGuideFileFields = [
  { name: "ID", maxCount: 1 },
  { name: "Certificates", maxCount: 5 },
];

router.post(
  "/sign-up/tourist",
  upload.single(""),
  authController.touristSignup
);
router.post(
  "/sign-up/advertiser",
  upload.fields(advertiserSellerFileFields),
  authController.advertiserSignup
);
router.post(
  "/sign-up/tour-guide",
  upload.fields(tourGuideFileFields),
  authController.tourGuideSignup
);
router.post(
  "/sign-up/seller",
  upload.fields(advertiserSellerFileFields),
  authController.sellerSignup
);
router.get("/check-unique", authController.checkUnique);
router.get("/logout", authController.logout);
router.post("/login", authController.login);

module.exports = router;
