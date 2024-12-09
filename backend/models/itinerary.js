const mongoose = require("mongoose");
const Activity = require("./activity");
const Tag = require("./tag");
const Schema = mongoose.Schema;

const itinerarySchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    activities: [
      {
        day: {
          type: Number,
          required: true,
          min: 1, // Ensures the day is at least 1
        },
        name: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          required: true,
        },
        location: {
          address: {
            type: String,
            required: true,
          },
        },
        duration: {
          type: Number,
          required: true,
        },
        timing: {
          type: Date,
          // required: true,
        },
        category: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
          },
        ],
        tags: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Tag",
          },
        ],
        pictures: [
          {
            public_id: { type: String, required: true },
            url: { type: String, required: true },
          },
        ],
      },
    ],
    language: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    currency: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Currency",
      required: true,
    },
    // isRepeated: {
    //   type: Boolean,
    //   required: true,
    // },
    availableDates: [
      {
        date: {
          type: Date,
          required: true,
        },
      },
    ],
    accessibility: {
      type: Boolean,
      required: true,
    },
    pickUpLocation: {
      type: String,
      required: true,
    },
    dropOffLocation: {
      type: String,
      required: true,
    },
    isBooked: {
      type: Boolean,
      required: true,
      default: false,
    },
    isActivated: {
      type: Boolean,
      required: true,
      default: true,
    },
    appropriate: {
      type: Boolean,
      required: true,
      default: true,
    },
    tourGuide: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TourGuide",
      required: true,
    },
    allRatings: [
      {
        type: Number,
        min: 0,
        max: 5,
        default: 0,
      },
    ],
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    comments: [
      {
        username: {
          type: String, // Assuming username is required
        },
        rating: {
          type: Number,
          min: 0,
          max: 5,
          // required: true, // Assuming rating is required
        },
        content: {
          liked: {
            type: String,
            default: "", // Start with 0 likes
          },
          disliked: {
            type: String,
            default: "", // Start with 0 dislikes
          },
        },
        date: {
          type: Date,
        },
        tourist: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Tourist",
          required: true,
        },
      },
    ],
    isBookingOpen: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

itinerarySchema.statics.findByTourGuide = function (tourGuideId) {
  return this.find({ tourGuide: tourGuideId }).populate("tourGuide").exec();
};

itinerarySchema.statics.findByFields = async function (searchCriteria) {
  if (
    searchCriteria === undefined ||
    searchCriteria === null ||
    searchCriteria === ""
  ) {
    return this.find().populate("tourGuide").populate("activities").exec();
  }
  const query = [];

  query.push({ ["title"]: { $regex: new RegExp(searchCriteria, "i") } }); // Case-insensitive
  query.push({ ["language"]: { $regex: new RegExp(searchCriteria, "i") } }); // Case-insensitive
  query.push({
    ["activities.name"]: { $regex: new RegExp(searchCriteria, "i") },
  }); // Case-insensitive
  query.push({
    ["activities.description"]: { $regex: new RegExp(searchCriteria, "i") },
  }); // Case-insensitive

  // const cursor = this.find().cursor();

  // for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
  //   for (const activityId of activityIds) {
  //     if (doc.activities.includes(activityId)) {
  //       query.push({ _id: doc._id });
  //       break;
  //     }
  //   }
  // }
  // console.log(query);

  return this.find({ $or: query })
    .populate("tourGuide")
    .populate("activities")
    .exec(); // Perform a search with the regex query
};

itinerarySchema.statics.filter = async function (
  maxPrice,
  minPrice,
  upperDate,
  lowerDate,
  types,
  languages,
  isBooked
) {
  const query = [];
  let itineraries = null;
  console.log(
    maxPrice,
    minPrice,
    upperDate,
    lowerDate,
    types,
    languages,
    isBooked
  );

  if (maxPrice !== undefined && maxPrice !== null && maxPrice !== "") {
    query.push({ price: { $lte: maxPrice } });
  }
  if (minPrice !== undefined && minPrice !== null && minPrice !== "") {
    query.push({ price: { $gte: minPrice } });
  }
  if (languages !== undefined && languages !== null && languages.length !== 0) {
    const languageArray = Array.isArray(languages)
      ? languages
      : languages.split(","); // Ensure it's an array
    query.push({ language: { $in: languageArray } });
  }
  if (types !== undefined && types !== null && types.length !== 0) {
    const typeArray = Array.isArray(types) ? types : types.split(",");
    const typesIds = await Tag.find({ type: { $in: typeArray } }).select("_id");
    query.push({ "activities.tags": { $elemMatch: { $in: typesIds } } });
  }
  if (isBooked !== undefined && isBooked !== null) {
    query.push({ isBooked: isBooked });
  }

  console.log(upperDate, lowerDate);
  itineraries = await this.find({ $or: query });
  itineraries = itineraries.filter((itinerary) => {
    let isMatch = false;
    for (const date of itinerary.availableDates) {
      if (upperDate === undefined || lowerDate === undefined) {
        isMatch = true;
        break;
      }
      if (
        date.date <= new Date(upperDate) &&
        date.date >= new Date(lowerDate)
      ) {
        isMatch = true;
        break;
      }
    }
    return isMatch;
  });

  if (itineraries.length === 0) return [];

  return itineraries;
};

itinerarySchema.methods.addRating = async function (newRating) {
  // Calculate the new average rating by iterating over all comments
  const totalRatings = this.comments.length;
  const sumOfRatings = this.comments.reduce(
    (sum, comment) => sum + comment.rating,
    0
  );
  const averageRating = sumOfRatings / totalRatings;

  // Update the activity's rating with the new average
  this.rating = averageRating;

  // Save the updated activity document
  await this.save();

  return this.rating; // Return the new average rating
};

// Method to add a comment to the activity
itinerarySchema.methods.addComment = async function (comment) {
  // Add the new comment to the comments array
  this.comments.push(comment);

  // Save the updated activity document
  await this.save();

  return this.comments; // Return the updated comments array
};
const Itinerary = mongoose.model("Itinerary", itinerarySchema);
module.exports = Itinerary;
