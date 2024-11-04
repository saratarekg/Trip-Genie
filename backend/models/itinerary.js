const mongoose = require("mongoose");
const Activity = require("./activity");
const Schema = mongoose.Schema;

const itinerarySchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    activities: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Activity",
      },
    ],
    timeline: {
      type: String,
      required: true,
    },
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
    availableDates: [
      {
        date: {
          type: Date,
          required: true,
        },
        times: [
          {
            startTime: {
              type: String,
              required: true,
            },
            endTime: {
              type: String,
              required: true,
            },
          },
        ],
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

  const activities = await Activity.findByFields(searchCriteria);
  const activityIds = activities.map((tag) => tag._id);

  query.push({ ["title"]: { $regex: new RegExp(searchCriteria, "i") } }); // Case-insensitive
  query.push({ ["timeline"]: { $regex: new RegExp(searchCriteria, "i") } }); // Case-insensitive

  const cursor = this.find().cursor();

  for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
    for (const activityId of activityIds) {
      if (doc.activities.includes(activityId)) {
        query.push({ _id: doc._id });
        break;
      }
    }
  }
  // console.log(query);

  return this.find({ $or: query })
    .populate("tourGuide")
    .populate("activities")
    .exec(); // Perform a search with the regex query
};

itinerarySchema.statics.filter = async function (
  maxPrice,
  minPrice,
  upperdate,
  lowerdate,
  types,
  languages,
  isBooked
) {
  const query = [];
  let itineraries = null;

  if (maxPrice !== undefined && maxPrice !== null && maxPrice !== "") {
    query.push({ price: { $lte: maxPrice } });
  }
  if (minPrice !== undefined && minPrice !== null && minPrice !== "") {
    query.push({ price: { $gte: minPrice } });
  }

  if (upperdate !== undefined && upperdate !== null && upperdate !== "") {
    // console.log(upperdate);
    query.push({ ["availableDates.date"]: { $lte: upperdate } });
  }
  if (lowerdate !== undefined && lowerdate !== null && lowerdate !== "") {
    query.push({ ["availableDates.date"]: { $gte: lowerdate } });
  }
  if (languages !== undefined && languages !== null && languages.length !== 0) {
    const languageArray = Array.isArray(languages)
      ? languages
      : languages.split(","); // Ensure it's an array
    console.log(languages);
    query.push({ language: { $in: languageArray } });
  }
  if (isBooked !== undefined && isBooked !== null) {
    query.push({ isBooked: isBooked });
  }

  console.log("hello");
  console.log(query);
  if (query.length === 0)
    itineraries = await this.find()
      .populate("tourGuide")
      .populate("activities")
      .exec();
  else
    itineraries = await this.find({ $and: query })
      .populate("tourGuide")
      .populate("activities")
      .exec();

  if (itineraries.length === 0) return [];

  const itinerariesIds = itineraries.map((itinerary) =>
    itinerary._id.toString()
  );
  const cursor = this.find().cursor();
  let activities = [];
  if (types != undefined && types != null && types.length !== 0) {
    activities = await Activity.findByTagTypes(types);
  } else {
    return itineraries;
  }
  if (activities.length === 0) return [];

  const activityIds = activities.map((activity) => activity._id.toString());
  const query2 = [];

  for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
    if (itinerariesIds.includes(doc._id.toString())) {
      doc.activities.forEach((activity) => {
        if (activityIds.includes(activity._id.toString())) {
          query2.push({ _id: doc._id });
        }
      });
    }
  }

  console.log(query2);
  if (query2.length === 0) return [];

  return this.find({ $or: query2 })
    .populate("tourGuide")
    .populate("activities")
    .exec();
};

itinerarySchema.methods.addRating = async function (newRating) {
  // Calculate the new average rating by iterating over all comments
  const totalRatings = this.comments.length;
  const sumOfRatings = this.comments.reduce((sum, comment) => sum + comment.rating, 0);
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
