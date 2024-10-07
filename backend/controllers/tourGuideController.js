const TourGuide = require("../models/tourGuide");
const Tourist = require("../models/tourist");
const Advertiser = require("../models/advertiser");
const Seller = require("../models/seller");
const Admin = require("../models/admin");
const TourismGovernor = require("../models/tourismGovernor");
const Nationality = require("../models/nationality");
const mongoose = require("mongoose");
const Itinerary = require("../models/itinerary"); // Adjust the path as needed
const authController = require("./authController");

const { deleteItinerary } = require("./itineraryController");

const getTourGuideProfile = async (req, res) => {
  try {
    const tourGuideId = res.locals.user_id;

    // Find the tour guide by their ID
    const tourGuide = await TourGuide.findById(tourGuideId)
      .populate("nationality")
      .exec();

    if (!tourGuide) {
      return res.status(404).json({ message: "Tour Guide not found" });
    }

    // Respond with the tour guide's profile
    res.status(200).json(tourGuide);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateTourGuide = async (req, res) => {
  try {
    const {
      email,
      username,
      nationality,
      mobile,
      yearsOfExperience,
      previousWorks,
    } = req.body; // Data to update
    const { id } = req.params;

    // Find the TourGuide by ID and update it with the provided data
    const tourGuide = await TourGuide.findByIdAndUpdate(
      id,
      {
        email,
        username,
        nationality,
        mobile,
        yearsOfExperience,
        previousWorks,
      },
      { new: true, runValidators: true }
    );

    if (!tourGuide) {
      return res.status(404).json({ message: "Tour Guide not found" });
    }

    res
      .status(200)
      .json({ message: "Tour Guide updated successfully", tourGuide });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateTourGuideProfile = async (req, res) => {
  try {
    const tourGuide1 = await TourGuide.findById(res.locals.user_id);

    const {
      email,
      username,
      nationality,
      mobile,
      yearsOfExperience,
      previousWorks,
    } = req.body;

    const nat = await Nationality.findOne({ _id: nationality });

    if (username !== tourGuide1.username && (await usernameExists(username))) {
      return res.status(400).json({ message: "Username already exists" });
    }
    if (email !== tourGuide1.email && (await emailExists(email))) {
      return res.status(400).json({ message: "Email already exists" });
    }
    // Find the TourGuide by their ID and update with new data
    const tourGuide = await TourGuide.findByIdAndUpdate(
      res.locals.user_id,
      {
        email,
        username,
        mobile,
        yearsOfExperience,
        nationality: nat._id,
        previousWorks,
      },
      { new: true }
    )
      .populate("nationality")
      .exec();

    if (!tourGuide) {
      return res.status(404).json({ message: "Tour Guide not found" });
    }

    // Respond with the updated profile
    res
      .status(200)
      .json({ message: "Profile updated successfully", tourGuide });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllTourGuides = async (req, res) => {
  try {
    const tourGuide = await TourGuide.find();
    res.status(200).json(tourGuide);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTourGuideByID = async (req, res) => {
  try {
    const tourGuide = await TourGuide.findById(req.params.id);
    if (!tourGuide) {
      return res.status(404).json({ message: "Tour Guide not found" });
    }
    res.status(200).json(tourGuide);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteTourGuideAccount = async (req, res) => {
  try {
    const tourGuide = await TourGuide.findByIdAndDelete(req.params.id);
    if (!tourGuide) {
      return res.status(404).json({ message: "TourGuide not found" });
    }

    // Delete all itineraries associated with the tour guide
    await Itinerary.deleteMany({ tourGuide: req.params.id });
    res.status(201).json({ message: "TourGuide deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
  updateTourGuide,
  getTourGuideProfile,
  updateTourGuideProfile,
  deleteTourGuideAccount,
  getTourGuideByID,
  getAllTourGuides,
  getTourGuideByID,
};
