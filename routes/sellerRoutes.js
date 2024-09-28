const express = require("express");
const router = express.Router();
const sellerController = require("../controllers/sellerController");
const productController = require("../controllers/productController");

router.put("/", sellerController.updateSeller);

router.get("/", sellerController.getSeller);
router.get("/sort-products-rating", productController.sortProductsByRating);

router.get("/products/filterbyprice", productController.filterProductsByPrice);
router.get("/products", productController.getAllProducts);
router.get("/products/:name", productController.getProductbyName);
router.post("/products", productController.addProduct);

router.put("/products/:id", productController.editProduct);

module.exports = router;
