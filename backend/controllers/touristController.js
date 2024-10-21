const Tourist = require("../models/tourist");
const TourGuide = require("../models/tourGuide");
const Advertiser = require("../models/advertiser");
const Seller = require("../models/seller");
const Admin = require("../models/admin");
const TourismGovernor = require("../models/tourismGovernor");
const Product = require("../models/product");
const activity = require("../models/activity");
const ActivityBooking = require("../models/activityBooking");
const Purchase = require("../models/purchase");
const ItineraryBooking = require("../models/itineraryBooking");

const deleteTouristAccount = async (req, res) => {
  try {
    const tourist = await Tourist.findByIdAndDelete(req.params.id);
    if (!tourist) {
      return res.status(404).json({ message: "Tourist not found" });
    }
    res.status(201).json({ message: "Tourist deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllTourists = async (req, res) => {
  try {
    const tourist = await Tourist.find();
    res.status(200).json(tourist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTouristByID = async (req, res) => {
  try {
    const tourist = await Tourist.findById(req.params.id);
    if (!tourist) {
      return res.status(404).json({ message: "Tourist not found" });
    }
    res.status(200).json(tourist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTourist = async (req, res) => {
  try {
    const tourist = await Tourist.findById(res.locals.user_id);
    if (!tourist) {
      return res.status(404).json({ message: "Tourist not found" });
    }
    res.status(200).json(tourist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateTourist = async (req, res) => {
  try {
    const tourist1 = await Tourist.findById(res.locals.user_id);

    const { username, email, nationality, mobile, jobOrStudent } = req.body; // Data to update

    if (username !== tourist1.username && (await usernameExists(username))) {
      return res.status(400).json({ message: "Username already exists" });
    }
    if (email !== tourist1.email && (await emailExists(email))) {
      return res.status(400).json({ message: "Email already exists" });
    }
    // console.log(email, nationality, mobile, jobOrStudent);
    const tourist = await Tourist.findByIdAndUpdate(
      res.locals.user_id,
      { username, email, nationality, mobile, jobOrStudent },
      { new: true, runValidators: true }
    );
    if (!tourist) {
      return res.status(404).json({ message: "Tourist not found" });
    }
    res.status(200).json(tourist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTouristProfile = async (req, res) => {
  try {
    const touristId = res.locals.user_id;

    // Find the tour guide by their ID
    const tourist = await Tourist.findById(touristId)
      .populate("nationality")
      .exec();

    if (!tourist) {
      return res.status(404).json({ message: "Tourist not found" });
    }

    // Respond with the tour guide's profile
    res.status(200).json(tourist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTouristPreferences = async (req, res) => {
  try {
    const tourist = await Tourist.findById(res.locals.user_id);

    if (!tourist) {
      return res.status(404).json({ message: "Tourist not found" });
    }

    // Return the preferences
    res.status(200).json(tourist.preference);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updatePreferences = async (req, res) => {
  try {
    const tourist1 = await Tourist.findById(res.locals.user_id);

    const {
      budget,
      price,
      categories,
      tourLanguages,
      tourType,
      historicalPlaceType,
      historicalPlacePeriod,
    } = req.body; // Preferences to update

    // Update preferences
    const updatedTourist = await Tourist.findByIdAndUpdate(
      res.locals.user_id,
      {
        "preference.budget": budget ?? Infinity, // Use the existing value if not provided
        "preference.price": price ?? Infinity, // Use the existing value if not provided
        "preference.categories": categories ?? tourist1.preference.categories, // Use the existing value if not provided
        "preference.tourLanguages":
          tourLanguages ?? tourist1.preference.tourLanguages,
        "preference.tourType": tourType ?? tourist1.preference.tourType,
        "preference.historicalPlaceType":
          historicalPlaceType ?? tourist1.preference.historicalPlaceType,
        "preference.historicalPlacePeriod":
          historicalPlacePeriod ?? tourist1.preference.historicalPlacePeriod,
      },
      { new: true, runValidators: true }
    );

    if (!updatedTourist) {
      return res.status(404).json({ message: "Tourist not found" });
    }

    res.status(200).json(updatedTourist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateTouristProfile = async (req, res) => {
  try {
    const tourist1 = await Tourist.findById(res.locals.user_id);

    const {
      email,
      username,
      nationality,
      mobile,
      dateOfBirth,
      jobOrStudent,
      wallet,
    } = req.body;

    if (username !== tourist1.username && (await usernameExists(username))) {
      return res.status(400).json({ message: "Username already exists" });
    }
    if (email !== tourist1.email && (await emailExists(email))) {
      return res.status(400).json({ message: "Email already exists" });
    }
    // Find the Tourist by their ID and update with new data
    const tourist = await Tourist.findByIdAndUpdate(
      res.locals.user_id,
      {
        email,
        nationality,
        mobile,
        jobOrStudent,
      },
      { new: true }
    )
      .populate("nationality")
      .exec();

    if (!tourist) {
      return res.status(404).json({ message: "Tourist not found" });
    }

    // Respond with the updated profile
    res.status(200).json({ message: "Profile updated successfully", tourist });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const emailExists = async (email) => {
  if (await Tourist.findOne({ email })) {
    return true;
  } else if (await TourGuide.findOne({ email })) {
    return true;
  } else if (await Advertiser.findOne({ email })) {
    return true;
  } else if (await Seller.findOne({ email })) {
    return true;
  } else {
    console.log("email does not exist");
    return false;
  }
};

const usernameExists = async (username) => {
  if (
    (await Tourist.findOne({ username })) ||
    (await TourGuide.findOne({ username })) ||
    (await Advertiser.findOne({ username })) ||
    (await Seller.findOne({ username })) ||
    (await Admin.findOne({ username })) ||
    (await TourismGovernor.findOne({ username }))
  ) {
    console.log("username exists");
    return true;
  } else {
    console.log("username does not exist");
    return false;
  }
};

const redeemPoints = async (req, res) => {
  try {
    const conversionRate = 10000; // 10,000 points = 100 EGP
    const cashEquivalent = 100; // 100 EGP for 10,000 points

    // Fetch the tourist based on user ID (assuming tourist is the logged-in user)
    const tourist = await Tourist.findById(res.locals.user_id);

    if (!tourist) {
      return res.status(404).json({ error: "Tourist not found" });
    }

    // Check if the tourist has any loyalty points to redeem
    if (tourist.loyaltyPoints === 0) {
      return res
        .status(400)
        .json({ error: "No loyalty points available for redemption" });
    }

    // Redeem all loyalty points
    const pointsToRedeem = tourist.loyaltyPoints;

    // Calculate the redeemable cash based on all loyalty points
    const redeemableCash = (pointsToRedeem / conversionRate) * cashEquivalent;

    // Update the wallet and set loyalty points to 0
    const updatedTourist = await Tourist.findByIdAndUpdate(
      res.locals.user_id,
      {
        $set: { loyaltyPoints: 0 },
        $inc: { wallet: redeemableCash },
      },
      { new: true } // Return the updated document
    );

    res.status(200).json({
      message: `Successfully redeemed ${pointsToRedeem} points for ${redeemableCash} EGP`,
      walletBalance: updatedTourist.wallet,
      remainingPoints: updatedTourist.loyaltyPoints,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const tourist = await Tourist.findById(res.locals.user_id);
    if (!tourist) {
      return res.status(404).json({ message: "Tourist not found" });
    }
    const { oldPassword, newPassword } = req.body;
    const isMatch = await tourist.comparePassword(
      oldPassword,
      tourist.password
    );
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect old password" });
    }

    if (oldPassword === newPassword) {
      return res
        .status(400)
        .json({ message: "Old password and new password cannot be the same" });
    }
    tourist.password = newPassword;
    await tourist.save();
    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    if (error.name === "ValidationError") {
      // Gather all validation error messages
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return res
        .status(400)
        .json({ message: "Validation error", errors: validationErrors });
    }
    res.status(400).json({ error: error.message });
  }
};

// Tourist Controller
// Method to get the tourist's wishlist
const getWishlist = async (req, res) => {
  try {
    const userId = res.locals.user_id; // Get the logged-in tourist's ID from response locals

    // Find the tourist by their user ID
    const tourist = await Tourist.findById(userId)
      .populate("wishlist.product") // Populate product information in wishlist
      .exec();

    // Check if the tourist exists
    if (!tourist) {
      return res.status(400).json({ message: "Tourist not found" });
    }

    // Return the wishlist data
    res.status(200).json(tourist.wishlist);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Method to get the tourist's cart
const getCart = async (req, res) => {
  try {
    const userId = res.locals.user_id; // Get the logged-in tourist's ID from response locals

    // Find the tourist by their user ID
    const tourist = await Tourist.findById(userId)
      .populate("cart.product") // Populate product information in the cart
      .exec();

    // Check if the tourist exists
    if (!tourist) {
      return res.status(400).json({ message: "Tourist not found" });
    }
    console.log(tourist.cart);
    // Return the cart data
    res.status(200).json(tourist.cart);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const removeItemFromCart = async (req, res) => {
  const productId = req.params.id; // Extract the productId from the request body
  const userId = res.locals.user_id; // Get the user ID from the logged-in user

  try {
    // Debug: Log incoming request data
    console.log(
      "Removing item with productId:",
      productId,
      "for userId:",
      userId
    );

    // Find the tourist and update the cart by removing the product
    const user = await Tourist.findByIdAndUpdate(
      userId,
      {
        $pull: { cart: { product: productId } }, // Pull (remove) the item with the given productId
      },
      { new: true } // Return the updated document
    );

    // Check if user was found
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Check if the product was successfully removed
    if (!user.cart || user.cart.length === 0) {
      return res
        .status(400)
        .json({ message: "Cart is empty or item not found" });
    }

    // Success: Send back the updated cart
    res.status(200).json({ message: "Product removed from cart" });
  } catch (error) {
    // Debug: Print the error to console
    console.error("Error removing product from cart:", error);

    // Send a response with the error details
    res.status(500).json({ message: error.message });
  }
};

const emptyCart = async (req, res) => {
  console.log("hiii");
  const userId = res.locals.user_id; // Get the user ID from the logged-in user

  try {
    // Find the tourist and empty the cart by setting it to an empty array
    const user = await Tourist.findByIdAndUpdate(
      userId,
      { $set: { cart: [] } }, // Set the cart to an empty array
      { new: true } // Return the updated document
    );

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Cart emptied" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateCartProductQuantity = async (req, res) => {
  const { productId, newQuantity } = req.body; // Extract productId and newQuantity from the request body
  const userId = res.locals.user_id; // Get the user ID from the logged-in user

  try {
    // Validate that the new quantity is greater than 0
    if (newQuantity <= 0) {
      console.log(1);

      return res
        .status(400)
        .json({ message: "Quantity must be greater than 0" });
    }

    // Find the tourist and update the quantity of the product in the cart
    const user = await Tourist.findByIdAndUpdate(
      userId,
      {
        $set: { "cart.$[elem].quantity": newQuantity }, // Update the quantity field of the matching product
      },
      {
        arrayFilters: [{ "elem.product": productId }], // Find the item that matches the productId
        new: true, // Return the updated document
      }
    );

    if (!user) {
      console.log(2);
      return res.status(400).json({ message: "User not found" });
    }

    const cartItem = user.cart.find((item) => {
      console.log("Iterating over cart item:", item); // Log every iteration
      return item.product._id.toString() === productId.toString();
    });

    if (cartItem) {
      console.log("Found cart item:", cartItem);
    } else {
      console.log("No matching cart item found for productId:", productId);
    }
    if (!cartItem) {
      return res.status(400).json({ message: "Product not found in cart" });
    }

    res
      .status(200)
      .json({ message: "Cart product quantity updated", cart: user.cart });
  } catch (error) {
    // Log the full error object for debugging purposes
    console.error("Error details:", error);

    // Send back only the message for the client
    res.status(500).json({ message: error.message, stack: error.stack });
  }
};

const removeProductFromWishlist = async (req, res) => {
  const productId = req.params.id; // Extract productId from the request params
  console.log("Removing product with ID:", productId); // Debug log the productId being passed
  const userId = res.locals.user_id; // Get the logged-in user id

  try {
    // First, find the user and log their current wishlist
    const user = await Tourist.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Debug log the current wishlist
    console.log("Current wishlist:", user.wishlist);

    // Now, proceed to remove the product from the wishlist
    const updatedUser = await Tourist.findByIdAndUpdate(
      userId,
      {
        $pull: { wishlist: { product: productId } }, // Remove the product from the wishlist using $pull
      },
      { new: true } // Return the updated document
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "Failed to update user" });
    }

    // Debug log the updated wishlist
    console.log("Updated wishlist:", updatedUser.wishlist);

    res.status(200).json({
      message: "Product removed from wishlist",
      wishlist: updatedUser.wishlist, // Send back the updated wishlist
    });
  } catch (error) {
    console.error("Error removing product from wishlist:", error); // Log the full error
    res.status(500).json({ message: error.message });
  }
};

// Method to move a product from wishlist to cart
const moveProductToCart = async (req, res) => {
  const { id: productId } = req.params;
  const userId = res.locals.user_id; // Get logged-in user id

  try {
    // Find the product details using the productId
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(400).json({ message: "Product not found" });
    }

    // Find the user (tourist)
    const user = await Tourist.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Check if the product is already in the cart
    const existingCartItem = user.cart.find(
      (item) => item.product._id.toString() === productId
    );

    if (existingCartItem) {
      // If the product is already in the cart, update its quantity and totalPrice
      await Tourist.updateOne(
        { _id: userId, "cart.product": productId },
        {
          $set: {
            "cart.$.quantity": existingCartItem.quantity + 1, // Increase the quantity by 1
            "cart.$.totalPrice":
              (existingCartItem.quantity + 1) * product.price, // Update the total price
          },
        }
      );
    } else {
      // If the product is not in the cart, add it with quantity 1 and set the totalPrice
      await Tourist.findByIdAndUpdate(
        userId,
        {
          $push: {
            cart: {
              product: productId,
              quantity: 1,
              totalPrice: product.price,
            },
          },
        },
        { new: true }
      );
    }

    // Now remove the product from the wishlist
    await Tourist.findByIdAndUpdate(
      userId,
      {
        $pull: { wishlist: { product: productId } }, // Remove the product from wishlist
      },
      { new: true }
    );

    res.status(200).json({
      message: "Product moved to cart",
      cart: user.cart,
      wishlist: user.wishlist,
    });
  } catch (error) {
    console.error("Error occurred: ", error); // Logs the complete error object, including the stack trace
    res.status(500).json({
      message: "An error occurred",
      error: error.message, // Send only the error message in the response
      stack: process.env.NODE_ENV === "development" ? error.stack : null, // Send the stack trace in development mode only
    });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const tourist = await Tourist.findById(res.locals.user_id);
    if (!tourist) {
      return res.status(404).json({ message: "Tourist not found" });
    }

    const today = new Date(); // Get today's date
    const tomorrow = new Date(today); // Clone today's date
    tomorrow.setDate(today.getDate() + 1);

    bookedActivities = await ActivityBooking.find({
      user: res.locals.user_id,
    }).populate("activity");
    bookedActivities.forEach((activity) => {
      if (activity.timing > Date.now()) {
        return res
          .status(400)
          .json({ message: "Cannot delete account with active bookings" });
      }
    });

    bookedItineraries = await ItineraryBooking.find({
      user: res.locals.user_id,
      date: { $gte: tomorrow.toISOString() },
    });
    if (bookedItineraries.length > 0) {
      return res
        .status(400)
        .json({ message: "Cannot delete account with active bookings" });
    }

    purchases = await Purchase.find({
      tourist: res.locals.user_id,
      status: "pending",
    });
    if (purchases.length > 0) {
      return res
        .status(400)
        .json({ message: "Cannot delete account with pending purchases" });
    }

    await Complaint.deleteMany({ tourist: res.locals.user_id });

    await Tourist.findByIdAndDelete(res.locals.user_id);
    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  removeProductFromWishlist,
  moveProductToCart,
  deleteTouristAccount,
  getAllTourists,
  getTouristByID,
  getTourist,
  updateTourist,
  getTouristProfile,
  updateTouristProfile,
  redeemPoints,
  changePassword,
  updatePreferences,
  getTouristPreferences,
  getCart,
  getWishlist,
  removeItemFromCart,
  emptyCart,
  updateCartProductQuantity,
};
