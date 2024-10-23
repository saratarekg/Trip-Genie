const Itinerary = require("../models/itinerary");
const Tourist = require("../models/tourist");
const ItineraryBooking = require("../models/itineraryBooking");

// import { ItineraryBooking } from './models/itineraryBooking';

// GET all itineraries


const getAllItineraries = async (req, res) => {
  try {
    const {
      maxPrice,
      minPrice,
      upperDate,
      lowerDate,
      types,
      languages,
      searchBy,
      sort,
      asc,
      myItineraries,
      isBooked,
    } = req.query;

    const userRole = res.locals.user_role; // Assuming user role is stored in res.locals
    const userId = res.locals.user_id;

    const filterResult = await Itinerary.filter(
      maxPrice,
      minPrice,
      upperDate,
      lowerDate,
      types,
      languages,
      isBooked
    );

    const searchResult = await Itinerary.findByFields(searchBy);

    const searchResultIds = searchResult.map((itinerary) => itinerary._id);
    const filterResultIds = filterResult.map((itinerary) => itinerary._id);

    let query = [];
    query.push({ _id: { $in: searchResultIds } });
    query.push({ _id: { $in: filterResultIds } });
    query.push({ appropriate: true });
    
    if (!myItineraries) {
      query.push({
        availableDates: {
          $elemMatch: {
            date: { $gte: new Date() },
          },
        },
      });
    }

    // Handle different user roles
    if (userRole === 'tourist') {
      const bookedItineraries = await ItineraryBooking.find({ user: userId }).distinct('itinerary');
      query.push({
        $or: [
          { isActivated: true },
          { _id: { $in: bookedItineraries } }
        ]
      });
    } else if (userRole === 'tour-guide') {
      query.push({
        $or: [
          { isActivated: true },
          { tourGuide: userId }
        ]
      });
    } else {
      // For guests or any other role
      query.push({ isActivated: true });
    }

    if (myItineraries) {
      query.push({ tourGuide: userId });
    }

    let itinerariesQuery = Itinerary.find({ $and: query })
      .populate("tourGuide")
      .populate({ path: "activities", populate: { path: "tags category" } });

    if (sort) {
      const sortBy = {};
      sortBy[sort] = parseInt(asc);
      itinerariesQuery = itinerariesQuery.sort(sortBy);
    } else {
      itinerariesQuery = itinerariesQuery.sort({ createdAt: -1 });
    }

    const itineraries = await itinerariesQuery.exec();

    if (!itineraries || itineraries.length === 0) {
      return res.status(200).json([]);
    }
    res.status(200).json(itineraries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getItinerariesByPreference = async (req, res) => {
  try {
    // Fetch tourist preferences
    const tourist = await Tourist.findById(res.locals.user_id);

    if (!tourist) {
      return res.status(404).json({ message: "Tourist not found" });
    }

    const {
      budget,
      price,
      tourType,
      tourLanguages,
      historicalPlacePeriod,
      historicalPlaceType,
    } = tourist.preference;

    // Apply filters based on preferences and query params
    const {
      upperDate,
      lowerDate,
      sort,
      asc,
      myItineraries,
    } = req.query;

    console.log(budget, price, upperDate, lowerDate, tourType, tourLanguages);
    const filterResult = await Itinerary.filter(
      budget, //max
      price, //min
      upperDate,
      lowerDate,
      tourType,
      tourLanguages,
    );

    const searchResult = await Itinerary.findByFields(tourist.searchBy);

    const searchResultIds = searchResult.map((itinerary) => itinerary._id);
    const filterResultIds = filterResult.map((itinerary) => itinerary._id);

    const query = [];
    query.push({ _id: { $in: searchResultIds } });
    query.push({ _id: { $in: filterResultIds } });

    // Only show future itineraries if 'myItineraries' is not specified
      query.push({
        availableDates: {
          $elemMatch: {
            date: { $gte: new Date() },
          },
        },
      });
    

    let itinerariesQuery = Itinerary.find({
      $and: query,
    })
      .populate("tourGuide")
      .populate({ path: "activities", populate: { path: "tags category" } });

    // Apply sorting
    if (sort) {
      const sortBy = {};
      sortBy[sort] = parseInt(asc); // Ascending (1) or Descending (-1)
      itinerariesQuery = itinerariesQuery.sort(sortBy);
    } else {
      itinerariesQuery = itinerariesQuery.sort({ createdAt: -1 });
    }

    const itineraries = await itinerariesQuery;

    res.status(200).json(itineraries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const theHolyAntiFilter = async (req, res) => {
  try {
    // First, call getAllItineraries to get all itineraries
    const allItineraries = await new Promise((resolve, reject) => {
      getAllItineraries(req, {
        status: () => ({
          json: resolve,
        }),
        locals: res.locals,
      });
    });

    // Then, call getItinerariesByPreference to get itineraries based on user preferences
    const preferredItineraries = await new Promise((resolve, reject) => {
      getItinerariesByPreference(req, {
        status: () => ({
          json: resolve,
        }),
        locals: res.locals,
      });
    });

    // Map itinerary IDs for comparison
    const allItineraryIds = new Set(allItineraries.map((itinerary) => itinerary._id.toString()));
    const preferredItineraryIds = new Set(preferredItineraries.map((itinerary) => itinerary._id.toString()));

    // Find the set difference (itineraries in allItineraries but not in preferredItineraries)
    const differenceIds = [...allItineraryIds].filter(id => !preferredItineraryIds.has(id));

    // Filter out the itineraries that match the differenceIds from allItineraries
    const itinerariesDifference = allItineraries.filter((itinerary) =>
      differenceIds.includes(itinerary._id.toString())
    );

    // Return the set difference
    res.status(200).json(itinerariesDifference);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const getAllItinerariesAdmin = async (req, res) => {
  try {
    const {
      maxPrice,
      minPrice, 
      upperDate,
      lowerDate,
      types,
      languages,
      searchBy,
      sort,
      asc,
      myItineraries,
      isBooked,
    } = req.query;


    const filterResult = await Itinerary.filter(
      maxPrice,
      minPrice,
      upperDate,
      lowerDate,
      types,
      languages,
      isBooked
    );

    const searchResult = await Itinerary.findByFields(searchBy);

    const searchResultIds = searchResult.map((itinerary) => itinerary._id);
    const filterResultIds = filterResult.map((itinerary) => itinerary._id);

    let query = [];
    query.push({ _id: { $in: searchResultIds } });
    query.push({ _id: { $in: filterResultIds } });
    if (!myItineraries) {
      query.push({
        availableDates: {
          $elemMatch: {
            date: { $gte: new Date() }, // Match any date that is upcoming
          },
        },
      });
    }
    if (myItineraries) {
      query.push({ tourGuide: res.locals.user_id });
    }

    let itinerariesQuery = await Itinerary.find({
      $and: query,
    })
      .populate("tourGuide")
      .populate({ path: "activities", populate: { path: "tags category" } })
      .exec();

    if (sort) {
      const sortBy = {};
      sortBy[sort] = parseInt(asc); // Sort ascending (1) or descending (-1) based on your needs
      itinerariesQuery = await Itinerary.find({
        $and: query,
      })
        .populate("tourGuide")
        .populate({ path: "activities", populate: { path: "tags category" } })
        .sort(sortBy);
    } else {
      itinerariesQuery = await Itinerary.find({
        $and: query,
      })
        .populate("tourGuide")
        .populate({ path: "activities", populate: { path: "tags category" } })
        .sort({ createdAt: -1 });
    }

    const itineraries = await itinerariesQuery;

    if (!itineraries || itineraries.length === 0) {
      return res.status(200).json([]);
    }
    res.status(200).json(itineraries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// GET a single itinerary
const getItineraryById = async (req, res) => {
  try {
    const itinerary = await Itinerary.findById(req.params.id)
      .populate("tourGuide")
      .populate({ path: "activities", populate: { path: "tags category" } })
      .exec();
    if (!itinerary) {
      return res.status(404).json({ message: "Itinerary not found" });
    }
    console.log(itinerary);
    res.status(200).json(itinerary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST a new itinerary
const createItinerary = async (req, res) => {
  const {
    title,
    timeline,
    activities,
    language,
    price,
    availableDates,
    accessibility,
    pickUpLocation,
    dropOffLocation,
    rating,
  } = req.body;
  const itinerary = new Itinerary({
    title,
    timeline,
    activities,
    language,
    price,
    availableDates,
    accessibility,
    pickUpLocation,
    dropOffLocation,
    tourGuide: res.locals.user_id,
    rating,
  });

  try {
    await itinerary.save();
    res.status(201).json(itinerary);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// // DELETE a single itinerary
// const deleteItinerary = async (req, res) => {
//     try {
//         const itinerary = await Itinerary.findByIdAndDelete(req.params.id);
//         if (!itinerary) {
//             return res.status(404).json({ message: 'Itinerary not found' });
//         }
//         res.status(204).json();
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

// Update a single itinerary

const updateItinerary = async (req, res) => {
  try {
    const tourGuideId = res.locals.user_id; // Get the current tour guide's ID

    // Find the itinerary by ID
    const itinerary = await Itinerary.findById(req.params.id);

    if (!itinerary) {
      return res.status(404).json({ message: "Itinerary not found" });
    }

    // Check if the itinerary belongs to the current tour guide
    if (itinerary.tourGuide.toString() !== tourGuideId) {
      return res.status(403).json({
        message: "Unauthorized: You can only update your own itineraries",
      });
    }

    

    // Check if the itinerary is booked

    // If all checks pass, delete the itinerary
    const {
      title,
      availableDates,
      price,
      language,
      timeline,
      activities,
      accessibility,
      pickUpLocation,
      dropOffLocation,
      appropriate,
    } = req.body;

    await Itinerary.findByIdAndUpdate(req.params.id, {
      title,
      availableDates,
      price,
      language,
      timeline,
      activities,
      accessibility,
      pickUpLocation,
      dropOffLocation,
      appropriate,
    });

    res.status(200).json({ message: "Itinerary updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const flagItinerary = async (req, res) => {
  try {
   
    // Find the itinerary by ID
    const itinerary = await Itinerary.findById(req.params.id);

    if (!itinerary) {
      return res.status(404).json({ message: "Itinerary not found" });
    }

    // Check if the itinerary is booked

    // If all checks pass, delete the itinerary
    const {
      appropriate,
    } = req.body;

    await Itinerary.findByIdAndUpdate(req.params.id, {
      appropriate,
    });

    res.status(200).json({ message: "Itinerary updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};




const deleteItinerary = async (req, res) => {
  try {
    const tourGuideId = res.locals.user_id; // Get the current tour guide's ID

    // Find the itinerary by ID
    const itinerary = await Itinerary.findById(req.params.id);

    if (!itinerary) {
      return res.status(404).json({ message: "Itinerary not found" });
    }

    // Check if the itinerary belongs to the current tour guide
    if (itinerary.tourGuide.toString() !== tourGuideId) {
      return res.status(403).json({
        message: "Unauthorized: You can only delete your own itineraries",
      });
    }

    // Check if the itinerary is booked
    if (itinerary.isBooked) {
      return res.status(400).json({
        message: "Itinerary cannot be deleted as it is already booked",
      });
    }

    // If all checks pass, delete the itinerary
    await Itinerary.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Itinerary deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Function to get all itineraries for a specific tour guide

const getAllLanguages = async (req, res) => {
  try {
    const languages = await Itinerary.find().distinct("language");
    res.status(200).json(languages);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const addCommentToItinerary = async (req, res) => {
  try {
    const { username, rating, content } = req.body;
    
    if (rating === undefined) {
      rating = 0; // Default rating
    }

    if ( rating < 0 || rating > 5) {
      return res.status(400).json({ message: "Rating must be a number between 0 and 5" });
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
    

   
    // Find the activity by ID
    const itinerary = await Itinerary.findById(req.params.id);
      // .populate("advertiser")
      // .populate("category")
      // .populate("tags")
      // .exec();

    if (!itinerary) {
      return res.status(404).json({ message: "Itinerary not found" });
    }

    // Create the new comment object
    const newComment = {
      username: finalUsername,
      rating,
      content,
      date: new Date(), // Set the current date
    };

    console.log(newComment);

    // Add the comment to the activity's comments array
    itinerary.comments.push(newComment);

    // If the comment includes a rating, call the rateActivity method logic
    let newAverageRating;
    if (rating !== undefined) {
      newAverageRating = await itinerary.addRating(rating);
    }

    // Save the updated activity
    await itinerary.save();

    // Return the updated comments and new average rating (if applicable)
    res.status(200).json({
      message: "Comment added successfully",
      comments: itinerary.comments,
      ...(newAverageRating && { newAverageRating }), // Only include the new rating if it was updated
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred while adding the comment", error: error.message });
  }
};


const rateItinerary = async (req, res) => {
  try {
    
    const { rating } = req.body; // Get rating from the request body

    // Find the activity by ID
    const itinerary = await Itinerary.findById(req.params.id);
    // .populate("advertiser")
    // .populate("category")
    // .populate("tags")
    // .populate("comments")
    //.exec();

    // Add the rating and calculate the new average
    const newAverageRating = await itinerary.addRating(rating);
    // Return the new average rating
    res.status(200).json({ message: "Rating added", newAverageRating });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const toggleActivationStatus = async (req, res) => {
  try {
    const { id } = req.params; // Extract itinerary ID from the request parameters

    // Find the itinerary by its ID and toggle the isActivated field using update
    const itinerary = await Itinerary.findById(id);

    // If itinerary not found, return a 404 error
    if (!itinerary) {
      return res.status(404).json({ message: "Itinerary not found" });
    }

    // Use findByIdAndUpdate to toggle the activation status
    const updatedItinerary = await Itinerary.findByIdAndUpdate(
      id,
      { isActivated: !itinerary.isActivated }, // Toggle the isActivated field
      { new: true } // Return the updated document
    );

    // Return the updated itinerary details
    return res.status(200).json({
      message: `Itinerary ${updatedItinerary.isActivated ? 'activated' : 'deactivated'} successfully`,
      itinerary: updatedItinerary,
    });
  } catch (error) {
    // Handle any errors
    return res.status(500).json({ error: error.message });
  }
};


module.exports = {
  getAllItineraries,
  getAllItinerariesAdmin,
  getItineraryById,
  createItinerary,
  deleteItinerary,
  updateItinerary,
  getAllLanguages,
  addCommentToItinerary,
  rateItinerary,
  flagItinerary,
  toggleActivationStatus, 
  getItinerariesByPreference,
  theHolyAntiFilter,
};
