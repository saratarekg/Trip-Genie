const Museum = require("../models/historicalPlaces");
const cloudinary = require("../utils/cloudinary");
const Tourist = require("../models/tourist");

const createHistoricalPlace = async (req, res) => {
  const {
    title,
    description,
    location,
    historicalTag,
    openingHours,
    ticketPrices,
  } = req.body;

  try {
    let imagesBuffer = [];
    const pictures = req.files.map(
      (file) => `data:image/jpeg;base64,${file.buffer.toString("base64")}`
    );
    //upload multiple images using cloudinary
    for (let i = 0; i < pictures.length; i++) {
      const result = await cloudinary.uploader.upload(pictures[i], {
        folder: "historicalPlaces",
      });

      imagesBuffer.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    }

    const historicalPlace = new Museum({
      title,
      description,
      location,
      historicalTag,
      openingHours,
      ticketPrices,
      currency: "67140446ee157ee4f239d523",
      pictures: imagesBuffer,
      governor: res.locals.user_id,
    });
    await historicalPlace.save();
    res.status(201).json(historicalPlace);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getHistoricalPlace = async (req, res) => {
  try {
    const museum = await Museum.findById(req.params.id)
      .populate("historicalTag")
      .populate("governor")
      .exec();
    res.status(200).json(museum);
  } catch (error) {
    res.status(404).json({ message: "Place not found" });
  }
};

const getAllHistoricalPlaces = async (req, res) => {
  try {
    const { types, myPlaces, searchBy } = req.query;
    const filterResult = await Museum.filterByTag(types);
    const searchResult = await Museum.findByFields(searchBy);

    const searchResultIds = searchResult.map((place) => place._id);
    const filterResultIds = filterResult.map((place) => place._id);
    const query = [];
    query.push(
      { _id: { $in: searchResultIds } },
      { _id: { $in: filterResultIds } }
    );
    if (myPlaces === "true") {
      query.push({ governor: res.locals.user_id });
    }

    const historicalPlaces = await Museum.find({
      $and: query,
    })
      .populate("historicalTag")
      .sort({ createdAt: -1 })
      .exec();
    if (!historicalPlaces || historicalPlaces.length === 0) {
      return res.status(200).json([]);
    }
    res.status(200).json(historicalPlaces);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateHistoricalPlace = async (req, res) => {
  const { id } = req.params;
  const {
    title,
    location,
    description,
    historicalTag,
    openingHours,
    ticketPrices,
  } = req.body; // Get details from request body
  const museum = await Museum.findById(id);
  if (museum.governor.toString() != res.locals.user_id) {
    return res.status(403).json({
      message: "You are not authorized to edit this historical place",
    });
  }
  try {
    let { oldPictures } = req.body; // Get details from request body
    oldPictures = JSON.parse(oldPictures);

    let newPictures = req.files.map(
      (file) => `data:image/jpeg;base64,${file.buffer.toString("base64")}`
    );
    let imagesBuffer = [];

    for (let i = 0; i < newPictures.length; i++) {
      const result = await cloudinary.uploader.upload(newPictures[i], {
        folder: "historicalPlaces",
      });

      imagesBuffer.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    }

    const pictures = [...oldPictures, ...imagesBuffer];

    const oldPicturesIDs = oldPictures.map((pic) => pic.public_id);
    museum.pictures.forEach((pic) => {
      if (!oldPicturesIDs.includes(pic.public_id)) {
        cloudinary.uploader.destroy(pic.public_id);
      }
    });

    const updatedHP = await Museum.findByIdAndUpdate(
      id,
      {
        title,
        location,
        description,
        historicalTag,
        openingHours,
        ticketPrices,
        pictures,
      },
      { new: true, runValidators: true } // Options: return the updated document and run validation
    );

    if (!updatedHP) {
      return res.status(404).json({ message: "Historical Place not found" });
    }

    res.status(200).json(updatedHP);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteHistoricalPlace = async (req, res) => {
  try {
    const { id } = req.params;
    const museum = await Museum.findById(id);

    if (!museum) {
      return res.status(404).json({ message: "Historical Place not found" });
    }

    if (museum.governor.toString() != res.locals.user_id) {
      return res.status(403).json({
        message: "You are not authorized to delete this historical place",
      });
    }

    //delete images from cloudinary
    for (let i = 0; i < museum.pictures.length; i++) {
      await cloudinary.uploader.destroy(museum.pictures[i].public_id);
    }

    const museum2 = await Museum.findByIdAndDelete(id);

    res.status(200).json({ message: "Historical Place deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const filterHistoricalPlaces = async (req, res) => {
  try {
    const { types } = req.body;
    const filterResult = await Museum.filterByTag(types);
    const searchResult = await Museum.findByFields(searchBy);

    const searchResultIds = searchResult.map((place) => place._id);
    const filterResultIds = filterResult.map((place) => place._id);

    const historicalPlaces = await Museum.find({
      $and: [
        { _id: { $in: searchResultIds } },
        { _id: { $in: filterResultIds } },
      ],
    });
    if (!historicalPlaces || historicalPlaces.length === 0) {
      return res.status(404).json({ message: "No historical places found." });
    }
    res.status(200).json(historicalPlaces);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const filterHistoricalPlacesByPreferences = async (req, res) => {
  try {
    const tourist = await Tourist.findById(res.locals.user_id);
    const types = tourist.preference.historicalPlaceType;

    const filterResult = await Museum.filterByTag(types);

    if (!filterResult || filterResult.length === 0) {
      return res.status(200).json([]);
    }
    res.status(200).json(filterResult);
  }
  catch (error) {
    res.status(500).json({ error: error.message });
  }

};

const theHolyAntiFilter = async (req, res) => {
  // get all the historical places using promise
  // get all historical places by preferences using promise
  // get the set difference between them and return it 
  try {
    // First, call getAllHistoricalPlaces to get all historical places
    const allHistoricalPlaces = await new Promise((resolve, reject) => {
      getAllHistoricalPlaces(req, {
        status: () => ({
          json: resolve,
        }),
        locals: res.locals,
      });
    });
  
    // Then, call filterHistoricalPlacesByPreferences to get historical places based on user preferences
    const preferredHistoricalPlaces = await new Promise((resolve, reject) => {
      filterHistoricalPlacesByPreferences(req, {
        status: () => ({
          json: resolve,
        }),
        locals: res.locals,
      });
    });
  
    // Map historical place IDs for comparison
    const allHistoricalPlaceIds = new Set(
      allHistoricalPlaces.map((place) => place._id.toString())
    );
    const preferredHistoricalPlaceIds = new Set(
      preferredHistoricalPlaces.map((place) => place._id.toString())
    );
  
    // Find the set difference (places in allHistoricalPlaces but not in preferredHistoricalPlaces)
    const differenceIds = [...allHistoricalPlaceIds].filter(
      (id) => !preferredHistoricalPlaceIds.has(id)
    );
  
    // Filter out the historical places that match the differenceIds from allHistoricalPlaces
    const historicalPlacesDifference = allHistoricalPlaces.filter((place) =>
      differenceIds.includes(place._id.toString())
    );
  
    // Return the set difference
    res.status(200).json(historicalPlacesDifference);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
  
}



const getHistoricalPlacesByGovernor = async (req, res) => {
  try {
    const governorId = res.locals.user_id; // Assuming governorId is passed in the request params
    const historicalPlaces = await Museum.findByGovernor(governorId);
    if (!historicalPlaces || historicalPlaces.length === 0) {
      return res
        .status(404)
        .json({ message: "No historical places found for this governor." });
    }
    res.status(200).json(historicalPlaces);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createHistoricalPlace,
  getHistoricalPlace,
  getAllHistoricalPlaces,
  updateHistoricalPlace,
  deleteHistoricalPlace,
  filterHistoricalPlaces,
  getHistoricalPlacesByGovernor,
  filterHistoricalPlacesByPreferences,
  theHolyAntiFilter
};
