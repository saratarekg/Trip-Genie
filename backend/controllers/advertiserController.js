const Advertiser = require("../models/advertiser");
const Tourist = require("../models/tourist");
const TourGuide = require("../models/tourGuide");
const Seller = require("../models/seller");
const Admin = require("../models/admin");
const TourismGovernor = require("../models/tourismGovernor");
const Activity = require("../models/activity");
const { deleteActivity } = require("./activityController");
const ActivityBooking = require("../models/activityBooking");
const cloudinary = require("../utils/cloudinary");

const deleteAdvertiserAccount = async (req, res) => {
  try {
    const advertiser = await Advertiser.findById(res.locals.user_id).lean();
    if (!advertiser) {
      return res.status(404).json({ message: "Advertiser not found" });
    }

    // Find all activities associated with the advertiser
    const activities = await Activity.find({
      advertiser: res.locals.user_id,
      timing: { $gte: new Date() },
    });
    const activityIDs = activities.map((activity) => activity._id);
    const bookedActivities = await ActivityBooking.find({
      activity: { $in: activityIDs },
    });

    if (bookedActivities.length > 0) {
      return res.status(400).json({
        message: "Advertiser has upcoming activities, can not delete account",
      });
    }

    // Delete all activities associated with the advertiser
    activities.forEach(async (activity) => {
      await Activity.findByIdAndUpdate(activity._id, { isDeleted: true });
    });

    if (advertiser.logo !== null) {
      await cloudinary.uploader.destroy(advertiser.logo.public_id);
    }

    const gfs = req.app.locals.gfs;
    if (!gfs) {
      return res.status(500).send("GridFS is not initialized");
    }
    const fileNames = [
      advertiser.files.IDFilename,
      advertiser.files.taxationRegistryCardFilename,
    ];
    const files = await gfs.find({ filename: { $in: fileNames } }).toArray();
    if (!files || files.length === 0) {
      return res.status(404).json({ err: "No file exists" });
    }
    files.forEach(async (file) => {
      await gfs.delete(file._id);
    });

    await Advertiser.findByIdAndDelete(res.locals.user_id);

    res
      .status(200)
      .json({ message: "Advertiser account deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteAdvertiser = async (req, res) => {
  try {
    const id = req.params.id;
    const advertiser = await Advertiser.findById(id).lean();
    if (!advertiser) {
      return res.status(404).json({ message: "Advertiser not found" });
    }

    // Find all activities associated with the advertiser
    const activities = await Activity.find({
      advertiser: id,
      timing: { $gte: new Date() },
    });
    const activityIDs = activities.map((activity) => activity._id);
    const bookedActivities = await ActivityBooking.find({
      activity: { $in: activityIDs },
    });

    if (bookedActivities.length > 0) {
      return res.status(400).json({
        message: "Advertiser has upcoming activities, can not delete account",
      });
    }

    // Delete all activities associated with the advertiser
    activities.forEach(async (activity) => {
      await Activity.findByIdAndUpdate(activity._id, { isDeleted: true });
    });

    if (advertiser.logo !== null) {
      await cloudinary.uploader.destroy(advertiser.logo.public_id);
    }

    const gfs = req.app.locals.gfs;
    if (!gfs) {
      return res.status(500).send("GridFS is not initialized");
    }
    const fileNames = [
      advertiser.files.IDFilename,
      advertiser.files.taxationRegistryCardFilename,
    ];
    const files = await gfs.find({ filename: { $in: fileNames } }).toArray();
    if (!files || files.length === 0) {
      return res.status(404).json({ err: "No file exists" });
    }
    files.forEach(async (file) => {
      await gfs.delete(file._id);
    });

    await Advertiser.findByIdAndDelete(id);

    res
      .status(200)
      .json({ message: "Advertiser account deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const rejectAdvertiser = async (req, res) => {
  const { id } = req.params;
  try {
    const advertiser = await Advertiser.findByIdAndDelete(id);
    if (!advertiser) {
      return res.status(400).json({ message: "Advertiser not found" });
    }
    const gfs = req.app.locals.gfs;

    if (!gfs) {
      return res.status(500).send("GridFS is not initialized");
    }

    const filenames = [];
    filenames.push(advertiser.files.IDFilename);
    filenames.push(advertiser.files.taxationRegistryCardFilename);
    const files = await gfs.find({ filename: { $in: filenames } }).toArray();
    if (!files || files.length === 0) {
      return res.status(404).json({ err: "No file exists" });
    }

    await gfs.delete(files[0]._id);
    await gfs.delete(files[1]._id);

    res.status(200).json({ message: "Advertiser rejected successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllAdvertisers = async (req, res) => {
  try {
    const advertiser = await Advertiser.find().sort({ createdAt: -1 });
    res.status(200).json(advertiser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAdvertiserByID = async (req, res) => {
  try {
    const advertiser = await Advertiser.findById(req.params.id);
    if (!advertiser) {
      return res.status(404).json({ message: "Advertiser not found" });
    }
    res.status(200).json(advertiser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateAdvertiser = async (req, res) => {
  try {
    const advertiser1 = await Advertiser.findById(res.locals.user_id).lean();
    if (!advertiser1.isAccepted) {
      return res.status(400).json({
        error: "Advertiser is not accepted yet, Can not update profile",
      });
    }

    const { name, description, hotline, website } = req.body;
    let { email, username } = req.body;
    email = email.toLowerCase();
    username = username.toLowerCase();

    let logo = req.body.logo ? JSON.parse(req.body.logo) : undefined;

    if (username !== advertiser1.username && (await usernameExists(username))) {
      return res.status(400).json({ message: "Username already exists" });
    }
    if (email !== advertiser1.email && (await emailExists(email))) {
      return res.status(400).json({ message: "Email already exists" });
    }

    if (logo === undefined) {
      logo = null;
      if (advertiser1.logo !== null) {
        await cloudinary.uploader.destroy(advertiser1.logo.public_id);
      }
    } else if (logo.public_id === undefined) {
      const result = await cloudinary.uploader.upload(logo, {
        folder: "logos",
      });
      if (advertiser1.logo !== null) {
        await cloudinary.uploader.destroy(advertiser1.logo.public_id);
      }
      logo = {
        public_id: result.public_id,
        url: result.secure_url,
      };
    }
    const advertiser = await Advertiser.findByIdAndUpdate(
      res.locals.user_id,
      { email, username, name, description, hotline, website, logo },
      { new: true, runValidators: true }
    );

    if (!advertiser) {
      return res.status(400).json({ error: "Advertiser not found" });
    }
    res.status(200).json({ message: "Advertiser profile updated", advertiser });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: "Error updating advertiser profile" });
  }
};

const getAdvertiser = async (req, res) => {
  try {
    const advertiser = await Advertiser.findById(res.locals.user_id);
    if (!advertiser.isAccepted) {
      return res.status(400).json({
        error: "Advertiser is not accepted yet, Can not view profile",
      });
    }
    if (!advertiser) {
      return res.status(404).json({ message: "Advertiser not found" });
    }
    res.status(200).json(advertiser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUnacceptedAdvertisers = async (req, res) => {
  try {
    const unacceptedAdvertisers = await Advertiser.find({
      isAccepted: false,
    }).populate("files");
    res.status(200).json(unacceptedAdvertisers);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching unaccepted advertisers",
      error: error.message,
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const advertiser = await Advertiser.findById(res.locals.user_id);
    if (!advertiser) {
      return res.status(404).json({ message: "Advertiser not found" });
    }
    const { oldPassword, newPassword } = req.body;
    const isMatch = await advertiser.comparePassword(
      oldPassword,
      advertiser.password
    );
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect old password" });
    }

    if (oldPassword === newPassword) {
      return res
        .status(400)
        .json({ message: "Old password and new password cannot be the same" });
    }
    advertiser.password = newPassword;
    await advertiser.save();
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
const approveAdvertiser = async (req, res) => {
  const { id } = req.params;
  console.log(id);
  try {
    const updatedAdvertiser = await Advertiser.findByIdAndUpdate(
      id,
      { isAccepted: true },
      { new: true } // Returns the updated document
    );

    if (!updatedAdvertiser) {
      return res.status(404).json({ message: "Advertiser not found" });
    }

    res.status(200).json({
      message: "Advertiser approved successfully",
      advertiser: updatedAdvertiser,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error approving advertiser", error: error.message });
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

const getAdvertiserNotifications = async (req, res) => {
  try {
    // Get seller ID from res.locals
    const advertiserId = res.locals.user_id;

    if (!advertiserId) {
      return res.status(400).json({ message: "Advertiser ID is required" });
    }

    // Find the seller and get their notifications
    const advertiser = await Advertiser.findById(advertiserId, "notifications");

    if (!advertiser) {
      return res.status(404).json({ message: "Advertiser not found" });
    }

    // Sort notifications in descending order based on the 'date' field
    const sortedNotifications = advertiser.notifications.sort((a, b) => b.date - a.date);

    // Return the sorted notifications
    return res.status(200).json({ notifications: sortedNotifications });
  } catch (error) {
    console.error("Error fetching notifications:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const markNotificationsAsSeen = async (req, res) => {
  try {
    // Find the advertiser by their ID and update the notifications in one operation
    const result = await Advertiser.updateOne(
      { _id: res.locals.user_id }, // Find advertiser by user ID
      {
        $set: {
          'notifications.$[elem].seen': true, // Set 'seen' to true for all unseen notifications
        }
      },
      {
        arrayFilters: [{ 'elem.seen': false }], // Only update notifications where seen is false
      }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: 'No unseen notifications found' });
    }

    res.json({ message: 'All notifications marked as seen' });
  } catch (error) {
    console.error("Error marking notifications as seen:", error.message);
    res.status(500).json({ message: 'Error marking notifications as seen' });
  }
};

const hasUnseenNotifications = async (req, res) => {
  try {
    // Find the seller by their ID
    const advertiser = await Advertiser.findById(res.locals.user_id);

    if (!advertiser) {
      return res.status(404).json({ message: 'Advertiser not found' });
    }

    // Check if there are any unseen notifications
    const hasUnseen = advertiser.notifications.some(notification => !notification.seen);

    res.json({ hasUnseen });
  } catch (error) {
    console.error("Error checking unseen notifications:", error.message);
    res.status(500).json({ message: 'Error checking unseen notifications' });
  }
};

const markNotificationAsSeenForAdvertiser = async (req, res) => {
  try {
    const notificationId = req.params.notificationId; // Get the notification ID from the request parameters

    // Find the advertiser by their ID and update the specific notification by its ID
    const result = await Advertiser.updateOne(
      { 
        _id: res.locals.user_id, // Find the advertiser by their user ID
        "notifications._id": notificationId, // Match the specific notification by its ID
        "notifications.seen": false // Ensure that the notification is unseen
      },
      {
        $set: {
          "notifications.$.seen": true, // Set 'seen' to true for the specific notification
        },
      }
    );

    if (result.modifiedCount === 0) {
      return res.status(400).json({ message: "Notification not found or already marked as seen" });
    }

    res.json({ message: "Notification marked as seen" });
  } catch (error) {
    console.error("Error marking notification as seen for advertiser:", error.message);
    res.status(500).json({ message: "Error marking notification as seen for advertiser" });
  }
};


module.exports = {
  deleteAdvertiserAccount,
  deleteAdvertiser,
  getAllAdvertisers,
  markNotificationAsSeenForAdvertiser,
  getAdvertiserByID,
  updateAdvertiser,
  getAdvertiser,
  changePassword,
  getUnacceptedAdvertisers,
  approveAdvertiser,
  rejectAdvertiser,
  hasUnseenNotifications,
  markNotificationsAsSeen,
  getAdvertiserNotifications
};
