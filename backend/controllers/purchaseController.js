const Product = require("../models/product"); // Assuming your model is in models/activityBooking.js
const Purchase = require("../models/purchase"); // Assuming your Activity model is in models/activity.js
const Tourist = require("../models/tourist"); // Assuming your Tourist model is in models/tourist.js
const productSales = require("../models/productSales");

exports.createPurchase = async (req, res) => {
  const {
    products,
    paymentMethod,
    deliveryDate,
    deliveryType,
    deliveryTime,
    shippingAddress,
    locationType,
  } = req.body;
  console.log(products, paymentMethod, shippingAddress);
  try {
    // Validate fields
    if (
      !products ||
      products.length === 0 ||
      !paymentMethod ||
      !shippingAddress
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const userId = res.locals.user_id; // Get the user's ID from response locals
    const tourist = await Tourist.findById(userId);

    if (!tourist) {
      return res.status(400).json({ message: "Tourist not found" });
    }

    let totalPrice = 0; // Initialize total price

    // Loop through the products array to calculate the total price
    for (const item of products) {
      const { product, quantity } = item; // product now refers to the productId

      // Check if the product exists
      const productDoc = await Product.findById(product); // Use `product` which is the product ID
      if (!productDoc) {
        return res
          .status(400)
          .json({ message: `Product not found for ID ${product}` });
      }

      // Calculate the price for this product and add it to the total price
      totalPrice += productDoc.price * quantity;
      const day = new Date().getDate();
      const month = new Date().getMonth() + 1;
      const year = new Date().getFullYear();
      if (await productSales.findOne({ product, day, month, year })) {
        await productSales.updateOne(
          { product, day, month, year },
          { $inc: { sales: quantity, revenue: productDoc.price * quantity } }
        );
      } else {
        const newProductSales = new productSales({
          product,
          sales: quantity,
          revenue: productDoc.price * quantity,
          day,
          month,
          year,
        });
        await newProductSales.save();
      }
    }

    // Add delivery price to the total
    let delPrice = 0;
    if (deliveryType === "Standard") {
      delPrice = 2.99;
    } else if (deliveryType === "Express") {
      delPrice = 4.99;
    } else if (deliveryType === "Next-Same") {
      delPrice = 6.99;
    } else {
      delPrice = 14.99; // International delivery
    }
    totalPrice += delPrice;

    // Check if the payment method is 'wallet'
    if (paymentMethod === "wallet") {
      // Check if the tourist has enough funds in their wallet
      if (tourist.wallet < totalPrice) {
        return res
          .status(400)
          .json({ message: "Insufficient funds in wallet" });
      }

      // Deduct the total price from the tourist's wallet
      await Tourist.findByIdAndUpdate(
        userId,
        { $inc: { wallet: -totalPrice } },
        { new: true, runValidators: true }
      );
    }

    // Create a new purchase with an array of products
    const newPurchase = new Purchase({
      tourist: userId,
      products, // Array of { product: productId, quantity }
      totalPrice,
      paymentMethod,
      deliveryDate,
      deliveryTime,
      shippingAddress,
      deliveryType,
      locationType,
      status: "pending",
    });

    // Save the purchase to the database
    await newPurchase.save();

    // Update the product's stock quantity and sales
    for (const item of products) {
      const { product, quantity } = item; // Using `product` (the productId)
      await Product.findByIdAndUpdate(
        product,
        {
          $inc: {
            quantity: -quantity, // Decrease product quantity
            sales: quantity, // Increase product sales
          },
        },
        { new: true, runValidators: true }
      );
    }

    return res.status(201).json({ message: "Purchase successful" });
  } catch (error) {
    console.error("Error: ", error.message);
    return res.status(500).json({ error: error.message });
  }
};

// Get all purchases by a specific tourist
exports.getPurchasesByTourist = async (req, res) => {
  const touristId = res.locals.user_id;

  try {
    // Fetch all purchases made by the tourist
    const purchases = await Purchase.find({ tourist: touristId })
      .populate("products.product") // Populate the product details
      .exec();

    if (!purchases.length) {
      return res
        .status(400)
        .json({ message: "No purchases found for this tourist" });
    }

    return res.status(200).json(purchases);
  } catch (error) {
    console.error("Error fetching tourist purchases: ", error.message); // Print the error message to the console
    return res.status(500).json({ error: error.message }); // Return the error message in the response
  }
};

// Get all purchases by a specific product
exports.getPurchasesByProduct = async (req, res) => {
  const { productId } = req.params;

  try {
    // Fetch all purchases of the specific product
    const purchases = await Purchase.find({ product: productId })
      .populate("tourist") // Populate the tourist details
      .exec();

    if (!purchases.length) {
      return res
        .status(404)
        .json({ message: "No purchases found for this product" });
    }

    return res.status(200).json({ purchases });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Get all purchases
exports.getAllPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find()
      .populate("tourist") // Populate the tourist details
      .populate("product") // Populate the product details
      .exec();

    if (!purchases.length) {
      return res.status(404).json({ message: "No purchases found" });
    }

    return res.status(200).json({ purchases });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Delete a specific purchase
exports.deletePurchase = async (req, res) => {
  const { purchaseId } = req.params;

  try {
    // Find the purchase and delete it
    const purchase = await Purchase.findByIdAndDelete(purchaseId);

    if (!purchase) {
      return res.status(404).json({ message: "Purchase not found" });
    }

    // Update the product sales accordingly
    for (const item of purchase.products) {
      const { product, quantity } = item;
      await productSales.updateOne(
        {
          product,
          day: purchase.createdAt.getDate(),
          month: purchase.createdAt.getMonth() + 1,
          year: purchase.createdAt.getFullYear(),
        },
        { $inc: { sales: -quantity, revenue: -product.price * quantity } }
      );
    }

    return res.status(200).json({ message: "Purchase deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
