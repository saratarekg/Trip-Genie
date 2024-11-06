const mongoose = require("mongoose");
const HistoricalTag = require("./historicalTags");
const Schema = mongoose.Schema;

const historicalPlacesSchema = new Schema(
  {
    title: { type: String, required: [true, "Please enter a name"] },
    description: {
      type: String,
      required: [true, "Please enter a description"],
    },

    location: {
      address: { type: String, required: [true, "Please enter an address"] },
      city: { type: String, required: false },
      country: { type: String, required: [true, "Please enter a country"] },
    },
    historicalTag: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "HistoricalTag",
        required: [true, "Please enter a tag"],
      },
    ],
    openingHours: {
      weekdays: String,
      weekends: String,
    },
    ticketPrices: {
      foreigner: { type: Number, default: 0 },
      native: { type: Number, default: 0 },
      student: { type: Number, default: 0 },
    },
    currency: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Currency",
      required: true,
    },
    pictures: [
      {
        public_id: { type: String, required: true },
        url: { type: String, required: true },
      },
    ], // Array of GridFS filenames
    governor: {
      // New field for the maker's ID
      type: mongoose.Schema.Types.ObjectId,
      ref: "TourismGovernor", // Replace 'User' with the appropriate model name for makers
      required: true, // Assuming it's required, you can set this to false if it's optional
    },
  },
  {
    timestamps: true,
  }
);

historicalPlacesSchema.statics.findByGovernor = function (governorId) {
  return this.find({ governor: governorId }).populate("governor").exec();
};

historicalPlacesSchema.statics.findByFields = async function (searchCriteria) {
  if (
    searchCriteria === undefined ||
    searchCriteria === null ||
    searchCriteria === ""
  ) {
    return this.find().populate("governor").populate("historicalTag").exec();
  }
  const query = [];

  const historicalTags = await HistoricalTag.searchByFields(searchCriteria);
  console.log(historicalTags);
  const tagIds = historicalTags.map((tag) => tag._id);

  searchFields = [
    "title",
    "description",
    "location.address",
    "location.city",
    "location.country",
  ];
  searchFields.forEach((field) => {
    query.push({ [field]: { $regex: new RegExp(searchCriteria, "i") } }); // Case-insensitive
  });

  const cursor = this.find().cursor();

  for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
    for (const tagId of tagIds) {
      if (doc.historicalTag && doc.historicalTag.includes(tagId)) {
        query.push({ _id: doc._id });
        break;
      }
    }
  }

  return this.find({ $or: query })
    .populate("governor")
    .populate("historicalTag")
    .exec(); // Perform a search with the regex query
};

historicalPlacesSchema.statics.filterByTag = async function (types, periods) {
  const query = [];
  let historicalTags = null;
  if (
    (types === undefined || types === null || types.length === 0) &&
    (periods === undefined || periods === null || periods.length === 0)
  ) {
    return await this.find()
      .populate("governor")
      .populate("historicalTag")
      .exec();
  } else if (types === undefined || types === null || types.length === 0) {
    const array = Array.isArray(periods) ? periods : periods.split(","); // Ensure it's an array
    historicalTags = await HistoricalTag.find({ period: { $in: array } });
  } else if (
    periods === undefined ||
    periods === null ||
    periods.length === 0
  ) {
    const array = Array.isArray(types) ? types : types.split(","); // Ensure it's an array
    historicalTags = await HistoricalTag.find({ type: { $in: array } });
  } else {
    const array = Array.isArray(types) ? types : types.split(","); // Ensure it's an array

    const array2 = Array.isArray(periods) ? periods : periods.split(","); // Ensure it's an array
    historicalTags = await HistoricalTag.find({
      type: { $in: array },
      period: { $in: array2 },
    });
  }
  if (historicalTags.length === 0) {
    return [];
  }

  const tagIds = historicalTags.map((tag) => tag._id);
  const cursor = this.find().cursor();

  for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
    for (const tagId of tagIds) {
      if (doc.historicalTag.includes(tagId)) {
        query.push({ _id: doc._id });
        break;
      }
    }
  }
  if (query.length === 0) {
    return [];
  }
  return this.find({ $or: query })
    .populate("governor")
    .populate("historicalTag")
    .exec();
};

const historicalPlaces = mongoose.model(
  "HistoricalPlace",
  historicalPlacesSchema
);
module.exports = historicalPlaces;
