const Itinerary = require("../models/itinerary");
const Tourist = require("../models/tourist");
// GET all itineraries
const getAllItineraries = async (req, res) => {
  try {
    const {
      budget,
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

  const userRole = res.locals.role; 

    const filterResult = await Itinerary.filter(
      budget,
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

    // Apply the appropriate condition only for "tourist" or "guest" roles
    if (userRole === "tourist" || userRole === "guest") {
      query.push({ appropriate: true });
    }

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
      // .populate("attended")
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
    // .populate("attended")
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

module.exports = {
  getAllItineraries,
  getItineraryById,
  createItinerary,
  deleteItinerary,
  updateItinerary,
  getAllLanguages,
  addCommentToItinerary,
  rateItinerary,
  flagItinerary,
};
