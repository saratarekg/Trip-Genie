const Admin = require("../models/admin");
const TourismGovernor = require("../models/tourismGovernor");
const Tourist = require("../models/tourist");
const Seller = require("../models/seller");
const Advertiser = require("../models/advertiser");
const TourGuide = require("../models/tourGuide");
const TourismGovernor1 = require("../controllers/tourismGovernorController");
const Tourist1 = require("../controllers/touristController");
const Seller1 = require("../controllers/sellerController");
const Advertiser1 = require("../controllers/advertiserController");
const TourGuide1 = require("../controllers/tourGuideController");

const addAdmin = async (req, res) => {
  try {
    // console.log(req.body);
    if (await usernameExists(req.body.username)) {
      throw new Error("Username already exists");
    }
    const admin = new Admin(req.body);

    admin
      .save()
      .then((result) => {
        res.status(201).json({ admin: result });
      })
      .catch((err) => {
        res.status(400).json({ message: err.message });
        console.log(err);
      });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const deleteAdminAccount = async (req, res) => {
  try {
    const admin = await Admin.findByIdAndDelete(req.params.id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    res.status(201).json({ message: "Admin deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllAdmins = async (req, res) => {
  try {
    const admin = await Admin.find().sort({ createdAt: -1 });
    res.status(200).json(admin);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUsersByRoles = async (req, res) => {
  const { role } = req.query; // Extract the role from the query parameters

  try {
    // Fetch all users for each category
    const admin = await Admin.find();
    const tourist = await Tourist.find();
    const governor = await TourismGovernor.find();
    const seller = await Seller.find();
    const tourGuide = await TourGuide.find();
    const advertiser = await Advertiser.find();

    // Combine all users into one array
    const allUsers = [
      ...admin.map((user) => ({ ...user.toObject(), role: "admin" })),
      ...tourist.map((user) => ({ ...user.toObject(), role: "tourist" })),
      ...governor.map((user) => ({ ...user.toObject(), role: "governor" })),
      ...seller.map((user) => ({ ...user.toObject(), role: "seller" })),
      ...tourGuide.map((user) => ({ ...user.toObject(), role: "tourGuide" })),
      ...advertiser.map((user) => ({ ...user.toObject(), role: "advertiser" })),
    ];

    // Filter users by role if specified
    const filteredUsers = role
      ? allUsers.filter((user) => user.role === role)
      : allUsers;

    // Return the filtered array as a response
    res.status(200).json({
      users: filteredUsers,
    });
  } catch (error) {
    // Handle any errors that occur
    res.status(500).json({ error: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    // Fetch all users for each category
    const admin = await Admin.find();
    const tourist = await Tourist.find();
    const governor = await TourismGovernor.find();
    const seller = await Seller.find();
    const tourGuide = await TourGuide.find();
    const advertiser = await Advertiser.find();

    // Combine all users into one array
    const allUsers = [
      ...admin,
      ...tourist,
      ...governor,
      ...seller,
      ...tourGuide,
      ...advertiser,
    ];

    // Return the combined array as a response
    res.status(200).json({
      allUsers,
    });
  } catch (error) {
    // Handle any errors that occur
    res.status(500).json({ error: error.message });
  }
};

const getAdminByID = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    res.status(200).json(admin);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const admin = await Admin.findById(res.locals.user_id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    const { oldPassword, newPassword } = req.body;
    const isMatch = await admin.comparePassword(oldPassword, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect old password" });
    }

    if (oldPassword === newPassword) {
      return res
        .status(400)
        .json({ message: "Old password and new password are the same" });
    }
    admin.password = newPassword;
    await admin.save();
    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
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
    return true;
  } else {
    return false;
  }
};

module.exports = {
  addAdmin,
  getAdminByID,
  getAllAdmins,
  deleteAdminAccount,
  getAllUsers,
  getUsersByRoles,
  changePassword,
};
