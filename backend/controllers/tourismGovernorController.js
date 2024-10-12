const TourismGovernor = require("../models/tourismGovernor");
const Admin = require("../models/admin");
const HistoricalPlace = require("../models/historicalPlaces"); // Adjust the path as needed
const Tourist = require("../models/tourist");
const Seller = require("../models/seller");
const Advertiser = require("../models/advertiser");
const TourGuide = require("../models/tourGuide");
const { deleteHistoricalPlace } = require("./historicalPlacesController");


const addTourismGovernor = async (req, res) => {
  try{
    if(await usernameExists(req.body.username)){
      throw new Error("Username already exists");
    }

    const tourismGovernor = new TourismGovernor(req.body);

    tourismGovernor
      .save()
      .then((result) => {
        res.status(201).json({ tourismGovernor: result });
      })
      .catch((err) => {
        res.status(400).json({message: err.message})
        console.log(err);
      });
  }
    catch(err){
    res.status(400).json({message: err.message});
  }
};

const deleteTourismGovAccount = async (req, res) => {
  try {
    const tourismGov = await TourismGovernor.findByIdAndDelete(req.params.id);
    if (!tourismGov) {
      return res.status(404).json({ message: "Tourism Governor not found" });
    }

    // Find all activities associated with the advertiser
    const historicals = await HistoricalPlace.find({
      advertiser: req.params.id,
    });

    // Call the deleteActivity method for each activity associated with the advertiser
    for (const historical of historicals) {
      await deleteHistoricalPlace({ params: { id: activity._id } }, res);
    }
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
        .json({ message: "Old password and new password are the same" });
    }
    tourismGovernor.password = newPassword;
    await tourismGovernor.save();
    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  addTourismGovernor,
  getTourismGovByID,
  getAllTourismGov,
  deleteTourismGovAccount,
  changePassword,
};
