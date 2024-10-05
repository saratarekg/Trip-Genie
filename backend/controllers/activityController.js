const Activity = require("../models/activity");
const Category = require("../models/category");
const Itinerary = require("../models/itinerary");

const getAllActivities = async (req, res) => {

  try {


    const { price, startDate, endDate, category, minRating,searchBy,sort,asc,myActivities } = req.query;

    const filterResult = await Activity.filter(price, startDate, endDate, category, minRating);


    const searchResult = await Activity.findByFields(searchBy);
    console.log("I am eternal");

    const searchResultIds = searchResult.map((activity) => activity._id);
    const filterResultIds = filterResult.map((activity) => activity._id);

    console.log("I am all knowing");

    const query = [];
    query.push({ _id: { $in: searchResultIds }});
    query.push({ _id: { $in: filterResultIds }});
    query.push({ "timing": { $gte: new Date() } });

    console.log(filterResultIds)
    console.log(searchResultIds)

    if(myActivities){
      query.push({ advertiser: res.locals.user_id });
    }
    let activitiesQuery = Activity.find({
      $and: query,
    });


    if (sort) {
      const sortBy = {};
      sortBy[sort] = parseInt(asc); // Sort ascending (1) or descending (-1) based on your needs
      activitiesQuery = activitiesQuery.sort(sortBy);

    }
    


    const activities = await activitiesQuery;

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

module.exports = {
  getAllActivities,
  getActivityById,
  createActivity,
  deleteActivity,
  updateActivity
};
