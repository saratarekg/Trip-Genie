const Museum = require("../models/historicalPlaces");

const createHistoricalPlace = async (req, res) => {
  const {
    title,
    description,
    location,
    historicalTag,
    openingHours,
    ticketPrices,
    currency,
    pictures,
  } = req.body;
  const historicalPlace = new Museum({
    title,
    description,
    location,
    historicalTag,
    openingHours,
    ticketPrices,
    currency,
    pictures,
    governor: res.locals.user_id,
  });

  try {
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
    const { types, periods, myPlaces, searchBy } = req.query;
    const filterResult = await Museum.filterByTag(types, periods);
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
  const { id } = req.params; // Get product ID from URL parameters
  const {
    title,
    location,
    description,
    historicalTag,
    openingHours,
    ticketPrices,
    currency,
    pictures,
  } = req.body; // Get details from request body
  const museum = await Museum.findById(id);
  if (museum.governor.toString() != res.locals.user_id) {
    return res.status(403).json({
      message: "You are not authorized to edit this historical place",
    });
  }
  try {
    // Find the product by ID and update its details
    const updatedHP = await Museum.findByIdAndUpdate(
      id,
      {
        title,
        location,
        description,
        historicalTag,
        openingHours,
        ticketPrices,
        currency,
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
    if (museum.governor.toString() != res.locals.user_id) {
      return res.status(403).json({
        message: "You are not authorized to delete this historical place",
      });
    }

    const museum2 = await Museum.findByIdAndDelete(id);
    if (!museum2) {
      return res.status(404).json({ message: "Historical Place not found" });
    }
    res.status(200).json({ message: "Historical Place deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const filterHistoricalPlaces = async (req, res) => {
  try {
    const { types, periods } = req.body;
    const filterResult = await Museum.filterByTag(types, periods);
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
};
