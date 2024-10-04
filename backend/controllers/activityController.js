const Activity = require("../models/activity");
const Category = require("../models/category");
const Itinerary = require("../models/itinerary");

const getAllActivities = async (req, res) => {
  try {
    const activities = await Activity.find()
      .populate("category")
      .populate("tags")
      .populate("advertiser")
      .exec();
    res.status(200).json(activities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getActivityById = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) {
      return res.status(404).json({ message: "Activity not found" });
    }
    res.status(200).json(activity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// const createActivity = async (req, res) => {
//     const activity = new Activity(req.body);
//     try {
//         await activity.save();
//         res.status(201).json(activity);
//     } catch (error) {
//         res.status(400).json({ error: error.message });
//     }
// };

const createActivity = async (req, res) => {
  const {
    name,
    location,
    duration,
    description,
    timing,
    price,
    category,
    tags,
    specialDiscount,
    rating,
    isBookingOpen,
  } = req.body;
  const activity = new Activity({
    name,
    location,
    duration,
    timing,
    description,
    price,
    category,
    tags,
    specialDiscount,
    rating,
    isBookingOpen,
    advertiser: res.locals.user_id,
  });

  try {
    await activity.save();
    res.status(201).json(activity);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteActivity = async (req, res) => {
  try {
    // Delete the activity
    const activity = await Activity.findByIdAndDelete(req.params.id);
    if (!activity) {
      return res.status(404).json({ message: "Activity not found" });
    }

    // Remove the deleted activity from the 'activities' array in the Itinerary model
    await Itinerary.updateMany(
      { activities: req.params.id }, // Find itineraries with this activity
      { $pull: { activities: req.params.id } } // Remove the activity from the array
    );

    res.status(204).json();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const updateActivity = async (req, res) => {
  try {
    const activity = await Activity.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!activity) {
      return res.status(404).json({ message: "Activity not found" });
    }
    res.status(200).json(activity);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getActivitiesByAdvertiser = async (req, res) => {
  try {
    const advertiserID = res.locals.user_id;
    const activities = await Activity.findByAdvertiser(advertiserID);
    if (!activities || activities.length === 0) {
      return res
        .status(404)
        .json({ message: "No activities found for this advertiser." });
    }
    res.status(200).json(activities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const filterActivities = async (req, res) => {
  try {
    const { price, startDate, endDate, category, minRating,searchBy } = req.query;
    let query = [];

    if (price !== undefined && price !== null && price !== "") {
      query.push({ ["price"]: { $lte: price } });
    }
    if (startDate !== undefined && startDate !== null && startDate !== "") {
      query.push({ ["timeline.start"]: { $gte: startDate } });
    }
    if (endDate !== undefined && endDate !== null && endDate !== "") {
      query.push({ ["timeline.end"]: { $lte: endDate } });
    }
    if (category) {
      // Find the category by name and get its ObjectId
      const activityList = await Activity.findByCategoryNames(category);
      const activityIds = activityList.map((activity) => activity._id);
      query.push({ ["_id"]: { $in: activityIds } });
    }

    if (minRating !== undefined && minRating !== null && minRating !== "") {
      query.push({ ["rating"]: { $gte: minRating } });
    }
    console.log("Query Object:", query); // Log the query object

    const filterResult = await Activity.find({ $and: query }).populate(
      "category tags"
    );

    const searchResult = await Activity.findByFields(searchBy);

    const searchResultIds = searchResult.map((activity) => activity._id);
    const filterResultIds = filterResult.map((activity) => activity._id);

    const activities = await Activity.find({
      $and: [{ _id: { $in: searchResultIds }}, {_id: { $in: filterResultIds }} ],
    });

    res.status(200).json(activities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// const searchActivities = async (req, res) => {
//   try {
//     const { searchBy } = req.query;
//     const activities = await Activity.findByFields(searchBy);
//     if (!activities || activities.length === 0) {
//       return res.status(200).json([]);
//     }
//     res.status(200).json(activities);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

const sortActivities = async (req, res) => {
  try {
    const { sort, order } = req.query;
    let sortCriteria = {};

    if (sort === "price") {
      sortCriteria.price = order === "desc" ? -1 : 1;
    } else if (sort === "rating") {
      sortCriteria.rating = order === "desc" ? -1 : 1;
    } else {
      return res.status(400).json({ message: "Invalid sorting criteria" });
    }

    console.log("Sort Criteria:", sortCriteria);

    const activities = await Activity.find({
      "timeline.start": { $gte: new Date() },
    }).sort(sortCriteria);

    console.log("Activities found:", activities);

    if (activities.length === 0) {
      return res.status(404).json({ message: "No activities found" });
    }

    res.status(200).json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllActivities,
  getActivityById,
  createActivity,
  deleteActivity,
  updateActivity,
  filterActivities,
  getActivitiesByAdvertiser,
  // searchActivities,
  sortActivities,
};
