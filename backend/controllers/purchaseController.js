const Product = require('../models/product'); // Assuming your model is in models/activityBooking.js
const Purchase = require('../models/purchase'); // Assuming your Activity model is in models/activity.js
const Tourist = require('../models/tourist'); // Assuming your Tourist model is in models/tourist.js

exports.createPurchase = async (req, res) => {
  const { productId, quantity, paymentMethod } = req.body;

  try {
    if (!productId || !quantity || !paymentMethod) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const userId = res.locals.user_id; // Get the user's ID from response locals
    const tourist = await Tourist.findById(userId);

    if (!tourist) {
      return res.status(404).json({ message: "Tourist not found" });
    }

    // Check if the product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Calculate total price
    const totalPrice = product.price * quantity;

    // Check if the payment method is 'wallet'
    if (paymentMethod === "wallet") {
      // Check if the tourist has enough funds in their wallet
      if (tourist.wallet < totalPrice) {
        return res.status(400).json({ message: "Insufficient funds in wallet" });
      }

      // Use findByIdAndUpdate to subtract the total price from the user's wallet
      await Tourist.findByIdAndUpdate(
        userId,
        { $inc: { wallet: -totalPrice } }, // Decrease the wallet balance by the total price
        { new: true, runValidators: true } // Return the updated tourist document
      );
    }

    // Create a new purchase
    const newPurchase = new Purchase({
      tourist: userId,
      product: productId,
      quantity,
      totalPrice,
      paymentMethod, // Assuming payment is processed
    });

    // Save the purchase to the database
    await newPurchase.save();

    // Update the product's quantity (reduce it based on the purchase)
    const updatedProduct = await Product.findByIdAndUpdate(
      productId, // Assuming you have the product ID
      { $inc: { quantity: -quantity } }, // Decrease the quantity by the specified amount
      { new: true, runValidators: true } // Return the updated document and run validation
    );

    return res.status(201).json({ message: "Purchase successful", purchase: newPurchase });
  } catch (error) {
    console.error("Error: ", error.message); // Print the error message to the console
    return res.status(500).json({ error: error.message }); // Return the error message in the response
  }
};


// Get all purchases by a specific tourist
exports.getPurchasesByTourist = async (req, res) => {
  const  touristId  = res.locals.user_id;

  try {
    // Fetch all purchases made by the tourist
    const purchases = await Purchase.find({ tourist: touristId })
      .populate("product") // Populate the product details
      .exec();

    if (!purchases.length) {
      return res.status(400).json({ message: "No purchases found for this tourist" });
    }

    return res.status(200).json( purchases );
  } catch (error) {
    return res.status(500).json({ error: error.message });
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
      return res.status(404).json({ message: "No purchases found for this product" });
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

    return res.status(200).json({ message: "Purchase deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
