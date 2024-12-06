const Product = require("../models/product"); // Assuming your model is in models/activityBooking.js
const Purchase = require("../models/purchase"); // Assuming your Activity model is in models/activity.js
const Tourist = require("../models/tourist"); // Assuming your Tourist model is in models/tourist.js
const productSales = require("../models/productSales");
const PromoCode = require("../models/promoCode");
const Currency = require("../models/currency");
const CurrencyRates = require("../models/currencyRate");
const emailService = require("../services/emailService");

exports.createPurchase = async (req, res) => {
  const {
    products,
    paymentMethod,
    deliveryDate,
    deliveryType,
    deliveryTime,
    shippingAddress,
    locationType,
    promoCode,
  } = req.body;
  console.log(products, paymentMethod, shippingAddress, promoCode);
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

    const promoDetails = await PromoCode.findOne({
      code: promoCode,
    });

    totalPrice =
      totalPrice - ((totalPrice * promoDetails?.percentOff) / 100 || 0);

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
        {
          $push: {
            history: {
              transactionType: "payment",
              amount: totalPrice,
              details: `You paid for your order using your wallet`,
            },
          },
        },
        { new: true, runValidators: true }
      );
    }

    let usedPromoCode = null;
    if (promoCode) {
      try {
        usedPromoCode = await PromoCode.usePromoCode(promoCode);
      } catch (error) {
        // If there's an error with the promo code, we'll just log it and continue without applying a discount
        console.error(`Promo code error: ${error.message}`);
      }
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
      promoCode: usedPromoCode,
    });

    // Save the purchase to the database
    await newPurchase.save();

    const currency = (await Currency.findOne({
      _id: tourist.preferredCurrency,
    })) || { code: "USD" };
    const rates = await CurrencyRates.findOne();
    const exchangeRate = rates.rates.get(currency.code);

    const productsDetails = await Promise.all(
      products.map(async (item) => {
        const product = await Product.findById(item.product);
        product.price = product.price * exchangeRate;
        return { product, quantity: item.quantity };
      })
    );
    const exchangedPurchase = newPurchase;
    exchangedPurchase.totalPrice = exchangedPurchase.totalPrice * exchangeRate;

    await emailService.sendPurchaseConfirmationEmail(
      tourist.email,
      exchangedPurchase,
      productsDetails
    );

    // Update the product's stock quantity and sales
    for (const item of products) {
      const { product, quantity } = item; // Using `product` (the productId)

      const productDoc = await Product.findByIdAndUpdate(
        product,
        {
          $inc: {
            quantity: -quantity, // Decrease product quantity
            sales: quantity, // Increase product sales
          },
        },
        { new: true, runValidators: true }
      );

      const day = new Date().getDate();
      const month = new Date().getMonth() + 1;
      const year = new Date().getFullYear();
      let revenue = productDoc.price * quantity;
      console.log("The revenue is tiy: ", revenue);
      if (usedPromoCode) {
        revenue = revenue - ((revenue * usedPromoCode.percentOff) / 100 || 0);
        console.log("The revenue is bis: ", revenue);
      }

      console.log("The revenue is bts: ", revenue);

      if (await productSales.findOne({ product, day, month, year })) {
        await productSales.updateOne(
          { product, day, month, year },
          { $inc: { sales: quantity, revenue: revenue } }
        );
      } else {
        const newProductSales = new productSales({
          product,
          sales: quantity,
          revenue: revenue,
          day,
          month,
          year,
        });
        await newProductSales.save();
      }
    }

    await Tourist.findByIdAndUpdate(
      userId,
      { $set: { currentPromoCode: null } },
      { new: true, runValidators: true }
    );

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
      .populate("products.product") 
      .populate("promoCode")// Populate the product details
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

exports.getMyCurrentPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find({
      tourist: res.locals.user_id,
    }).populate("products.product");

    const currentPurchases = purchases.filter(
      (purchase) => new Date(purchase.deliveryDate) > new Date()
    );

    res.status(200).json(currentPurchases);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
};

exports.getMyPastPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find({
      tourist: res.locals.user_id,
    }).populate("products.product");

    const pastPurchases = purchases.filter(
      (purchase) => new Date(purchase.deliveryDate) < new Date()
    );

    res.status(200).json(pastPurchases);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
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

    if (purchase.promoCode) {
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

      await Product.findByIdAndUpdate(
        product,
        {
          $inc: {
            quantity: quantity, // Decrease product quantity
            sales: -quantity, // Increase product sales
          },
        },
        { runValidators: true }
      );
    }

    return res.status(200).json({ message: "Purchase deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

//cancel a purchase
exports.cancelPurchase = async (req, res) => {
  const { id } = req.params;
  console.log(id);

  try {
    // Fetch the purchase and populate the product details
    const purchase = await Purchase.findById(id)
      .populate("products.product")
      .exec();

    if (!purchase) {
      return res.status(400).json({ message: "Purchase not found" });
    }

    // Check if the purchase is already cancelled or delivered
    if (purchase.status === "cancelled") {
      return res.status(400).json({ message: "Purchase already cancelled" });
    }

    if (purchase.status === "delivered") {
      return res.status(400).json({ message: "Purchase already delivered" });
    }

    // Calculate the total refund amount keeping in mind if the purchase was with a promo code
    let totalRefund = 0;
    for (const item of purchase.products) {
      const { product, quantity } = item;
      totalRefund += product.price * quantity;
    }

    // Add delivery price to the total
    let delPrice = 0;
    if (purchase.deliveryType === "Standard") {
      delPrice = 2.99;
    } else if (purchase.deliveryType === "Express") {
      delPrice = 4.99;
    } else if (purchase.deliveryType === "Next-Same") {
      delPrice = 6.99;
    } else {
      delPrice = 14.99; // International delivery
    }

    //get promodetails by id
    const promoDetails = await PromoCode.findById(purchase.promoCode);

    if (purchase.promoCode) {
      totalRefund =
        totalRefund - ((totalRefund * promoDetails.percentOff) / 100 || 0);

      // Reduce the times used of the promo code
      const promo = await PromoCode.findByIdAndUpdate(
        purchase.promoCode,
        { $inc: { timesUsed: -1 } },
        { new: true, runValidators: true }
      );

      // Ensure the checkStatus() method is called on the updated promo document
      promo.checkStatus(); // Now this works because `promo` is the updated document
    }

    totalRefund += delPrice;

    // Update the product sales accordingly
    for (const item of purchase.products) {
      const { product, quantity } = item;
      let revenue = product.price * quantity;
      if (purchase.promoCode) {
        revenue = revenue - ((revenue * promoDetails.percentOff) / 100 || 0);
      }

      await productSales.updateOne(
        {
          product,
          day: purchase.createdAt.getDate(),
          month: purchase.createdAt.getMonth() + 1,
          year: purchase.createdAt.getFullYear(),
        },
        { $inc: { sales: -quantity, revenue: -revenue } }
      );

      await Product.findByIdAndUpdate(
        product,
        {
          $inc: {
            quantity: quantity, // Decrease product quantity
            sales: -quantity, // Increase product sales
          },
        },
        { runValidators: true }
      );
    }

    // Update the tourist's wallet with the refunded money
    const touristId = purchase.tourist; // assuming purchase contains the tourist's ID

    // Update the tourist's wallet balance by finding the tourist and adding the refund amount
    const updatedTourist = await Tourist.findByIdAndUpdate(
      touristId,
      {
        $inc: { wallet: totalRefund },
        $push: {
          history: {
            transactionType: "deposit",
            amount: totalRefund,
            details: `Refunded for Cancelling your Order`,
          },
        },
      }, // increment the wallet by totalRefund
      { new: true } // return the updated document
    );

    if (!updatedTourist) {
      return res.status(400).json({ message: "Tourist not found" });
    }

    // Update the purchase status to 'cancelled'
    await Purchase.findByIdAndUpdate(
      id,
      { status: "cancelled" },
      { new: true, runValidators: true }
    );

    // Return success response with refunded amount and new wallet balance
    return res.status(200).json({
      message: "Purchase cancelled successfully and refund issued",
      refundedAmount: totalRefund,
      newWalletBalance: updatedTourist.wallet,
      paymentMethod: purchase.paymentMethod,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};

//update the status of a purchase daily using cron job
exports.updatePurchaseStatus = async () => {
  try {
    await Purchase.updateMany(
      { status: "pending", deliveryDate: { $lt: new Date() } },
      { $set: { status: "delivered" } },
      { runValidators: true }
    );
  } catch (error) {
    console.error("Error updating purchase status:", error);
  }
};
