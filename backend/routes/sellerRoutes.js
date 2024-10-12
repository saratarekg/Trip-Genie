const express = require("express");
const router = express.Router();
const sellerController = require("../controllers/sellerController");
const productController = require("../controllers/productController");

router.put("/", sellerController.updateSeller);
router.get("/", sellerController.getSeller);
router.get("/seller/:id", sellerController.getSellerByID);

router.get("/products", productController.getAllProducts);
router.get("/products/:id", productController.getProductById);
router.post("/products", productController.addProduct);
router.delete("/products/:id", productController.deleteProductOfSeller);
router.put("/products/:id", productController.editProductOfSeller);

router.post("/password", sellerController.changePassword);

module.exports = router;
