const express = require("express");
const router = express.Router();
const sellerController = require("../controllers/sellerController");
const productController = require("../controllers/productController");
const multer = require("multer");
const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage: storage });

const currencyController = require("../controllers/currencyController");


// Routes for Seller Notifications
router.get("/notifications", sellerController.getSellerNotifications);
router.get("/unseen-notifications", sellerController.hasUnseenNotifications);
router.post('/mark-notifications-seen', sellerController.markNotificationsAsSeen);
router.post('/notifications/markAsSeen/:id', sellerController.markNotificationAsSeenForSeller);
router.post("/mark-dropdown-opened", sellerController.markDropdownAsOpened); // Mark dropdown opened route


router.get("/getCurrency/:id", currencyController.getCurrencyById);
router.get("/currencies", currencyController.getSupportedCurrencies);
router.get("/max-price-products", productController.getMaxPrice);
router.get("/max-price-products-my", productController.getMaxPriceMy);
router.get(
  "/max-price-products-archived",
  productController.getMaxPriceArchived
);

router.put("/", upload.single("logo"), sellerController.updateSeller);
router.get("/", sellerController.getSeller);
router.get("/seller/:id", sellerController.getSellerByID);

router.get("/products", productController.getAllProducts);
router.get("/productsarchive", productController.getAllProductsArchive);
router.get("/products/:id", productController.getProductById);
router.post(
  "/products",
  upload.array("pictures", 10),
  productController.addProduct
);
router.delete("/products/:id", productController.deleteProductOfSeller);
router.put(
  "/products/:id",
  upload.array("newPictures", 10),
  productController.editProductOfSeller
);
router.put("/archiveproducts/:id", productController.archiveProduct);
router.post("/password", sellerController.changePassword);
router.delete("/delete-account", sellerController.deleteSellerAccount);

router.get("/sales-report", sellerController.getSalesReport);

module.exports = router;
