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
const cloudinary = require("../utils/cloudinary");

const { deleteItinerary } = require("./itineraryController");
const itineraryBooking = require("../models/itineraryBooking");

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
    const tourGuide1 = await TourGuide.findById(req.params.id).lean();
    if (!tourGuide1) {
      return res.status(404).json({ message: "Tour Guide not found" });
    }

    const { name, nationality, mobile, yearsOfExperience, previousWorks } =
      req.body; // Data to update
    const { id } = req.params;
    let { email, username } = req.body;
    username = username.toLowerCase();
    email = email.toLowerCase();

    if (username !== tourGuide1.username && (await usernameExists(username))) {
      return res.status(400).json({ message: "Username already exists" });
    }
    if (email !== tourGuide1.email && (await emailExists(email))) {
      return res.status(400).json({ message: "Email already exists" });
    }

    let profilePicture = req.body.profilePicture
      ? JSON.parse(req.body.profilePicture)
      : undefined;

    if (profilePicture === undefined) {
      profilePicture = null;
      if (tourGuide1.profilePicture !== null) {
        await cloudinary.uploader.destroy(tourGuide1.profilePicture.public_id);
      }
    } else if (profilePicture.public_id === undefined) {
      const result = await cloudinary.uploader.upload(profilePicture, {
        folder: "tour-guide-profile-pictures",
      });
      if (tourGuide1.profilePicture !== null) {
        await cloudinary.uploader.destroy(tourGuide1.profilePicture.public_id);
      }
      profilePicture = {
        public_id: result.public_id,
        url: result.secure_url,
      };
    }

    // Find the TourGuide by ID and update it with the provided data
    const tourGuide = await TourGuide.findByIdAndUpdate(
      id,
      {
        name,
        email,
        username,
        nationality,
        mobile,
        yearsOfExperience,
        previousWorks,
        profilePicture,
      },
      { new: true, runValidators: true }
    );

    res
      .status(200)
      .json({ message: "Tour Guide updated successfully", tourGuide });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateTourGuideProfile = async (req, res) => {
  try {
    const tourGuide1 = await TourGuide.findById(res.locals.user_id).lean();
    if (!tourGuide1) {
      return res.status(404).json({ message: "Tour Guide not found" });
    }

    const { name, nationality, mobile, yearsOfExperience, previousWorks } =
      req.body;
    let { email, username } = req.body;
    username = username.toLowerCase();
    email = email.toLowerCase();

    let profilePicture = req.body.profilePicture
      ? JSON.parse(req.body.profilePicture)
      : undefined;

    const nat = await Nationality.findOne({ _id: nationality });

    if (username !== tourGuide1.username && (await usernameExists(username))) {
      return res.status(400).json({ message: "Username already exists" });
    }
    if (email !== tourGuide1.email && (await emailExists(email))) {
      return res.status(400).json({ message: "Email already exists" });
    }

    if (profilePicture === undefined) {
      profilePicture = null;
      if (tourGuide1.profilePicture !== null) {
        await cloudinary.uploader.destroy(tourGuide1.profilePicture.public_id);
      }
    } else if (profilePicture.public_id === undefined) {
      const result = await cloudinary.uploader.upload(profilePicture, {
        folder: "tour-guide-profile-pictures",
      });
      if (tourGuide1.profilePicture !== null) {
        await cloudinary.uploader.destroy(tourGuide1.profilePicture.public_id);
      }
      profilePicture = {
        public_id: result.public_id,
        url: result.secure_url,
      };
    }
    // Find the TourGuide by their ID and update with new data
    const tourGuide = await TourGuide.findByIdAndUpdate(
      res.locals.user_id,
      {
        name,
        email,
        username,
        mobile,
        yearsOfExperience,
        nationality: nat._id,
        previousWorks: JSON.parse(previousWorks),
        profilePicture,
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
    console.error(error); // This will print the full error object with stack trace
    res.status(500).json({ error: error.message });
  }
};
const getUnacceptedTourGuides = async (req, res) => {
  try {
    const unacceptedTourGuides = await TourGuide.find({ isAccepted: false });
    res.status(200).json(unacceptedTourGuides);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching unaccepted TourGuides",
      error: error.message,
    });
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
    const tourGuide = await TourGuide.findById(res.locals.user_id).lean();
    if (!tourGuide) {
      return res.status(404).json({ message: "TourGuide not found" });
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const itineraries = await Itinerary.find({ tourGuide: res.locals.user_id });
    const itinerariesIds = itineraries.map((itinerary) => itinerary._id);
    const bookedItineraries = await itineraryBooking.find({
      itinerary: { $in: itinerariesIds },
      date: { $gte: tomorrow.toISOString() },
    });

    if (bookedItineraries.length > 0) {
      return res.status(400).json({
        message: "You cannot delete your account because you have bookings",
      });
    }

    itineraries.forEach(async (itinerary) => {
      await Itinerary.findByIdAndUpdate(itinerary._id, { isDeleted: true });
    });

    if (tourGuide.profilePicture !== null) {
      await cloudinary.uploader.destroy(tourGuide.profilePicture.public_id);
    }

    const gfs = req.app.locals.gfs;

    if (!gfs) {
      return res.status(500).send("GridFS is not initialized");
    }

    const filenames = [
      tourGuide.files.IDFilename,
      ...tourGuide.files.certificatesFilenames,
    ];
    const files = await gfs.find({ filename: { $in: filenames } }).toArray();
    if (!files || files.length === 0) {
      return res.status(404).json({ err: "No file exists" });
    }
    files.forEach(async (file) => {
      await gfs.delete(file._id);
    });

    await TourGuide.findByIdAndDelete(res.locals.user_id);

    res
      .status(200)
      .json({ message: "Tour guide account deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteTourGuide = async (req, res) => {
  try {
    const { id } = req.params;
    const tourGuide = await TourGuide.findById(id).lean();
    if (!tourGuide) {
      return res.status(404).json({ message: "TourGuide not found" });
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const itineraries = await Itinerary.find({ tourGuide: id });
    const itinerariesIds = itineraries.map((itinerary) => itinerary._id);
    const bookedItineraries = await itineraryBooking.find({
      itinerary: { $in: itinerariesIds },
      date: { $gte: tomorrow.toISOString() },
    });

    if (bookedItineraries.length > 0) {
      return res.status(400).json({
        message: "You cannot delete your account because you have bookings",
      });
    }

    itineraries.forEach(async (itinerary) => {
      await Itinerary.findByIdAndUpdate(itinerary._id, { isDeleted: true });
    });

    if (tourGuide.profilePicture !== null) {
      await cloudinary.uploader.destroy(tourGuide.profilePicture.public_id);
    }

    const gfs = req.app.locals.gfs;

    if (!gfs) {
      return res.status(500).send("GridFS is not initialized");
    }

    const filenames = [
      tourGuide.files.IDFilename,
      ...tourGuide.files.certificatesFilenames,
    ];
    const files = await gfs.find({ filename: { $in: filenames } }).toArray();
    if (!files || files.length === 0) {
      return res.status(404).json({ err: "No file exists" });
    }
    files.forEach(async (file) => {
      await gfs.delete(file._id);
    });

    await TourGuide.findByIdAndDelete(id);

    res
      .status(200)
      .json({ message: "Tour guide account deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const rejectTourGuide = async (req, res) => {
  try {
    const { id } = req.params;
    const tourGuide = await TourGuide.findByIdAndDelete(id);
    console.log(tourGuide);
    if (!tourGuide) {
      return res.status(400).json({ message: "TourGuide not found" });
    }
    const gfs = req.app.locals.gfs;

    if (!gfs) {
      return res.status(500).send("GridFS is not initialized");
    }

    const filenames = [];
    filenames.push(tourGuide.files.IDFilename);
    filenames.push(...tourGuide.files.certificatesFilenames);
    const files = await gfs.find({ filename: { $in: filenames } }).toArray();
    if (!files || files.length === 0) {
      return res.status(404).json({ err: "No file exists" });
    }

    files.forEach(async (file) => {
      await gfs.delete(file._id);
    });

    res.status(200).json({ message: "TourGuide rejected successfully" });
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

const addCommentToTourGuide = async (req, res) => {
  try {
    const { username, rating, content } = req.body;

    if (rating === undefined) {
      rating = 0; // Default rating
    }

    if (rating < 0 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be a number between 0 and 5" });
    }

    const tourist = await Tourist.findById(res.locals.user_id);
    if (!tourist) {
      return res.status(404).json({ message: "Tourist not found" });
    }

    // Determine the username to use
    let finalUsername;

    if (username && username === "Anonymous") {
      finalUsername = "Anonymous"; // Use 'anonymous' as the username
    } else if (tourist.username) {
      finalUsername = tourist.username;
      // Use the authenticated user's username
    } else {
      return res.status(400).json({ message: "Valid username is required" });
    }

    const newComment = {
      username: finalUsername,
      rating,
      content,
      date: new Date(),
      tourist: tourist._id,
    };

    const tourguide = await TourGuide.findByIdAndUpdate(
      req.params.id,
      {
        $push: { comments: newComment }, // Push the new comment to the comments array
      },
      { new: true, runValidators: true } // Return the updated document, disable validators if needed
    );

    let newAverageRating;
    if (rating !== undefined) {
      newAverageRating = await tourguide.addRating(rating);
    }

    // await tourguide.save({ validateBeforeSave: false });

    res.status(200).json({
      message: "Comment added successfully",
      comments: tourguide.comments,
      ...(newAverageRating && { newAverageRating }),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "An error occurred while adding the comment",
      error: error.message,
    });
  }
};

const updateCommentOnTourGuide = async (req, res) => {
  try {
    const { rating, content, username } = req.body;
    const touristId = res.locals.user_id; // Assume `user_id` is the ID of the authenticated user

    // Validate the new rating if provided
    if (rating !== undefined && (rating < 0 || rating > 5)) {
      return res
        .status(400)
        .json({ message: "Rating must be a number between 0 and 5" });
    }

    // Retrieve tourist information for username determination
    const tourist = await Tourist.findById(touristId);
    if (!tourist) {
      return res.status(404).json({ message: "Tourist not found" });
    }

    // Determine the final username based on the provided username and tourist's stored username
    let finalUsername;
    if (username && username === "Anonymous") {
      finalUsername = "Anonymous"; // Use 'Anonymous' as the username
    } else if (tourist.username) {
      finalUsername = tourist.username; // Use the tourist's stored username
    } else {
      return res.status(400).json({ message: "Valid username is required" });
    }

    // Find the tour guide and update the specific comment by tourist ID
    const tourguide = await TourGuide.findOneAndUpdate(
      { _id: req.params.id, "comments.tourist": touristId }, // Match tour guide and specific comment by tourist ID
      {
        $set: {
          "comments.$.username": finalUsername, // Set the determined username
          "comments.$.rating": rating, // Update rating if provided
          "comments.$.content": content, // Update content if provided
        },
      },
      { new: true, runValidators: true } // Return the updated document
    );

    if (!tourguide) {
      return res
        .status(404)
        .json({ message: "Tour guide or comment not found" });
    }

    // Recalculate the average rating for the tour guide
    const newAverageRating = await tourguide.addRating(0); // Trigger rating recalculation

    res.status(200).json({
      message: "Comment updated successfully",
      comments: tourguide.comments,
      newAverageRating,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "An error occurred while updating the comment",
      error: error.message,
    });
  }
};

const rateTourGuide = async (req, res) => {
  try {
    const { rating } = req.body; // Get rating from the request body

    // Find the activity by ID
    const tourguide = await TourGuide.findById(req.params.id);

    // .populate("advertiser")
    // .populate("category")
    // .populate("tags")
    // .populate("comments")
    //.exec();

    // Add the rating and calculate the new average
    const newAverageRating = await tourguide.addRating(rating);

    // Return the new average rating
    res.status(200).json({ message: "Rating added", newAverageRating });
  } catch (error) {
    console.error("Error adding rating: ", error);
    res.status(500).json({ message: error.message });
  }
};

const approveTourGuide = async (req, res) => {
  const { id } = req.params;
  console.log(id);
  try {
    const updatedTourGuide = await TourGuide.findByIdAndUpdate(
      id,
      { isAccepted: true },
      { new: true } // Returns the updated document
    );

    if (!updatedTourGuide) {
      return res.status(404).json({ message: "TourGuide not found" });
    }

    res.status(200).json({
      message: "TourGuide approved successfully",
      tourGuide: updatedTourGuide,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error approving TourGuide", error: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const tourGuide = await TourGuide.findById(res.locals.user_id);
    if (!tourGuide) {
      return res.status(404).json({ message: "Tour Guide not found" });
    }
    const { oldPassword, newPassword } = req.body;
    const isMatch = await tourGuide.comparePassword(
      oldPassword,
      tourGuide.password
    );
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect old password" });
    }

    if (oldPassword === newPassword) {
      return res
        .status(400)
        .json({ message: "Old password and new password cannot be the same" });
    }
    tourGuide.password = newPassword;
    await tourGuide.save();
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

const getTourGuideNotifications = async (req, res) => {
  try {
    // Get seller ID from res.locals
    const tourGuideId = res.locals.user_id;

    if (!tourGuideId) {
      return res.status(400).json({ message: "TourGuide ID is required" });
    }

    // Find the seller and get their notifications
    const tourGuide = await TourGuide.findById(tourGuideId, "notifications");

    if (!tourGuide) {
      return res.status(404).json({ message: "TourGuide not found" });
    }

    // Sort notifications in descending order based on the 'date' field
    const sortedNotifications = tourGuide.notifications.sort((a, b) => b.date - a.date);

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
    const result = await TourGuide.updateOne(
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
    const tourGuide = await TourGuide.findById(res.locals.user_id);

    if (!tourGuide) {
      return res.status(404).json({ message: 'TourGuide not found' });
    }

    // Check if there are any unseen notifications
    const hasUnseen = tourGuide.notifications.some(notification => !notification.seen);

    res.json({ hasUnseen });
  } catch (error) {
    console.error("Error checking unseen notifications:", error.message);
    res.status(500).json({ message: 'Error checking unseen notifications' });
  }
};


module.exports = {
  updateTourGuide,
  getTourGuideProfile,
  updateTourGuideProfile,
  deleteTourGuideAccount,
  deleteTourGuide,
  getTourGuideByID,
  getAllTourGuides,
  getTourGuideByID,
  rateTourGuide,
  addCommentToTourGuide,
  changePassword,
  getUnacceptedTourGuides,
  approveTourGuide,
  rejectTourGuide,
  updateCommentOnTourGuide,
  hasUnseenNotifications,
  markNotificationsAsSeen,
  getTourGuideNotifications,
};
