const Tourist = require("../models/tourist");
const TourGuide = require("../models/tourGuide");
const Advertiser = require("../models/advertiser");
const Seller = require("../models/seller");
const Admin = require("../models/admin");
const TourismGovernor = require("../models/tourismGovernor");
const activity = require("../models/activity");

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
      historicalPlacePeriod
    } = req.body; // Preferences to update

    // Update preferences
    const updatedTourist = await Tourist.findByIdAndUpdate(
      res.locals.user_id,
      {
        "preference.budget": budget ?? tourist1.preference.budget, // Use the existing value if not provided
        "preference.price": price ?? tourist1.preference.price, // Use the existing value if not provided
        "preference.categories": categories ?? tourist1.preference.categories, // Use the existing value if not provided
        "preference.tourLanguages": tourLanguages ?? tourist1.preference.tourLanguages,
        "preference.tourType": tourType ?? tourist1.preference.tourType,
        "preference.historicalPlaceType": historicalPlaceType ?? tourist1.preference.historicalPlaceType,
        "preference.historicalPlacePeriod": historicalPlacePeriod ?? tourist1.preference.historicalPlacePeriod
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

const updateLoyaltyPointsAndBadge = async (req, res) => {
  try {
    const tourist1 = await Tourist.findById(res.locals.user_id);

    if (!tourist1) {
      return res.status(404).json({ message: "Tourist not found" });
    }

    const { loyaltyPoints } = req.body;

    // Calculate the new loyalty points
    const newLoyaltyPoints = tourist1.loyaltyPoints + loyaltyPoints;

    // Find the Tourist by their ID and update their loyalty points
    const updatedTourist = await Tourist.findByIdAndUpdate(
      res.locals.user_id,
      {
        loyaltyPoints: newLoyaltyPoints, // Correctly updating loyaltyPoints field
      },
      { new: true } // Return the updated document
    )
      .populate("nationality")
      .exec();

    if (!updatedTourist) {
      return res.status(404).json({ message: "Tourist not found" });
    }

    // Respond with the updated profile
    res.status(200).json({
      message: "Profile updated successfully",
      tourist: updatedTourist,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
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

module.exports = {
  deleteTouristAccount,
  getAllTourists,
  getTouristByID,
  getTourist,
  updateTourist,
  getTouristProfile,
  updateTouristProfile,
  updateLoyaltyPointsAndBadge,
  redeemPoints,
  changePassword,
  updatePreferences,
};
