const TourismGovernor = require("../models/tourismGovernor");
const Admin = require("../models/admin");
const HistoricalPlace = require("../models/historicalPlaces"); // Adjust the path as needed
const Tourist = require("../models/tourist");
const Seller = require("../models/seller");
const Advertiser = require("../models/advertiser");
const TourGuide = require("../models/tourGuide");
const { deleteHistoricalPlace } = require("./historicalPlacesController");

const addTourismGovernor = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (await usernameExists(username)) {
      throw new Error("Username already exists");
    } else if (await emailExists(email)) {
      throw new Error("Email already exists");
    }

    const tourismGovernor = new TourismGovernor({ username, email, password });

    tourismGovernor
      .save()
      .then((result) => {
        res.status(201).json({ tourismGovernor: result });
      })
      .catch((err) => {
        res.status(400).json({ message: err.message });
        console.log(err);
      });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getTourismGovernorProfile = async (req, res) => {
  try {
    const admin = await TourismGovernor.findById(res.locals.user_id);
    if (!admin) {
      return res.status(404).json({ message: "Toursim Governor not found" });
    }
    res.status(200).json(admin);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteTourismGovAccount = async (req, res) => {
  try {
    const tourismGov = await TourismGovernor.findByIdAndDelete(req.params.id);
    if (!tourismGov) {
      return res.status(404).json({ message: "Tourism Governor not found" });
    }

    // Delete all historical places created by the tourism governor
    await HistoricalPlace.deleteMany({ governor: req.params.id });

    res.status(201).json({ message: "Tourism Governor deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllTourismGov = async (req, res) => {
  try {
    const tourismGov = await TourismGovernor.find();
    res.status(200).json(tourismGov);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTourismGovByID = async (req, res) => {
  try {
    const tourismGov = await TourismGovernor.findById(req.params.id);
    if (!tourismGov) {
      return res.status(404).json({ message: "Tourism Governor not found" });
    }
    res.status(200).json(tourismGov);
  } catch (error) {
    res.status(500).json({ error: error.message });
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

const emailExists = async (email) => {
  if (
    (await Tourist.findOne({ email })) ||
    (await TourGuide.findOne({ email })) ||
    (await Advertiser.findOne({ email })) ||
    (await Seller.findOne({ email })) ||
    (await Admin.findOne({ email })) ||
    (await TourismGovernor.findOne({ email }))
  ) {
    return true;
  } else {
    return false;
  }
};

const changePassword = async (req, res) => {
  try {
    const tourismGovernor = await TourismGovernor.findById(res.locals.user_id);
    if (!tourismGovernor) {
      return res.status(404).json({ message: "Tourism Governor not found" });
    }
    const { oldPassword, newPassword } = req.body;
    const isMatch = await tourismGovernor.comparePassword(
      oldPassword,
      tourismGovernor.password
    );
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect old password" });
    }

    if (oldPassword === newPassword) {
      return res
        .status(400)
        .json({ message: "Old password and new password cannot be the same" });
    }
    tourismGovernor.password = newPassword;
    await tourismGovernor.save();
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
  addTourismGovernor,
  getTourismGovByID,
  getAllTourismGov,
  deleteTourismGovAccount,
  changePassword,
  getTourismGovernorProfile,
};
