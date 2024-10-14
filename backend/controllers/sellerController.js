const Seller = require("../models/seller");
const Product = require("../models/product");
const Tourist = require("../models/tourist");
const TourGuide = require("../models/tourGuide");
const Advertiser = require("../models/advertiser");
const Admin = require("../models/admin");
const TourismGovernor = require("../models/tourismGovernor");

// Update
const updateSeller = async (req, res) => {
  try {
    const seller1 = await Seller.findById(res.locals.user_id);

    if (!seller1.isAccepted) {
      return res
        .status(400)
        .json({ error: "Seller is not accepted yet, Can not update profile" });
    }
    const { email, username, name, description, mobile, logo } = req.body;

    if (username !== seller1.username && (await usernameExists(username))) {
      return res.status(400).json({ message: "Username already exists" });
    }
    if (email !== seller1.email && (await emailExists(email))) {
      return res.status(400).json({ message: "Email already exists" });
    }
    const seller = await Seller.findByIdAndUpdate(
      res.locals.user_id,
      { email, username, name, description, mobile, logo },
      { new: true }
    );

    if (!seller) {
      return res.status(404).json({ error: "Seller not found" });
    }
    res.status(200).json({ message: "Seller profile updated", seller });
  } catch (error) {
    console.log(error);
    res
      .status(400)
      .json({ error: "Error updating seller profile", message: error.message });
  }
};

const deleteSellerAccount = async (req, res) => {
  try {
    const seller = await Seller.findByIdAndDelete(req.params.id);
    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    // Delete all products associated with the seller
    await Product.deleteMany({ seller: seller._id });

    res.status(201).json({ message: "Seller and associated products deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllSellers = async (req, res) => {
  try {
    const seller = await Seller.find();
    res.status(200).json(seller);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getSellerByID = async (req, res) => {
  try {
    const seller = await Seller.findById(req.params.id);
    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }
    res.status(200).json(seller);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getSeller = async (req, res) => {
  try {
    const seller = await Seller.findById(res.locals.user_id);
    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }
    res.status(200).json(seller);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const seller = await Seller.findById(res.locals.user_id);
    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }
    const { oldPassword, newPassword } = req.body;
    const isMatch = await seller.comparePassword(oldPassword, seller.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect old password" });
    }

    if (oldPassword === newPassword) {
      return res
        .status(400)
        .json({ message: "Old password and new password cannot be the same" });
    }
    seller.password = newPassword;
    await seller.save();
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

module.exports = {
  deleteSellerAccount,
  getAllSellers,
  getSellerByID,
  updateSeller,
  getSeller,
  changePassword,
};
