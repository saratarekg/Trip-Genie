const express = require("express");
const router = express.Router();
const sellerController = require("../controllers/sellerController");
const productController = require("../controllers/productController");
const multer = require("multer");
const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage: storage });

const currencyController = require('../controllers/currencyController');


router.get('/getCurrency/:id', currencyController.getCurrencyById);
router.get("/currencies", currencyController.getSupportedCurrencies);


router.put("/", upload.single("logo"), sellerController.updateSeller);
router.get("/", sellerController.getSeller);
router.get("/seller/:id", sellerController.getSellerByID);

router.get("/products", productController.getAllProducts);
router.get("/productsarchive", productController.getAllProductsArchive);
router.get("/products/:id", productController.getProductById);
router.post(
  "/products",
  upload.array("pictures", 5),
  productController.addProduct
);
router.delete("/products/:id", productController.deleteProductOfSeller);
router.put(
  "/products/:id",
  upload.array("pictures", 5),
  productController.editProductOfSeller
);
router.put("/archiveproducts/:id", productController.archiveProduct);
router.post("/password", sellerController.changePassword);

module.exports = router;
