const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Schema = mongoose.Schema;

const tourGuideSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/.+@.+\..+/, "Please enter a valid email address"],
    },
    password: {
      type: String,
      required: true,
      trim: true,
      match: [
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/,
        "Password must contain at least 8 characters, including at least one uppercase letter, one lowercase letter, one number",
      ],
      minlength: 8,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters long"],
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    nationality: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Nationality",
      required: true,
      trim: true,
    },
    mobile: {
      type: String,
      required: true,
      trim: true,
      match: [
        /^\+\d{1,3}\d{7,15}$/,
        "Please enter a valid phone number with a country code and 7 to 15 digits.",
      ],
    },
    profilePicture: {
      public_id: { type: String },
      url: { type: String },
    },
    yearsOfExperience: {
      type: Number,
      required: true,
      min: [0, "Experience cannot be negative"],
      max: [50, "Experience cannot exceed 50 years"],
      validate: {
        validator: Number.isInteger,
        message: "{VALUE} is not an integer value",
      },
    },
    previousWorks: [
      {
        title: {
          type: String,
          required: true,
          trim: true,
        },
        company: {
          type: String,
          required: true,
          trim: true,
        },
        duration: {
          type: String,
          required: true,
          trim: true,
        },
        description: {
          type: String,
          trim: true,
        },
      },
    ],
    isAccepted: {
      type: Boolean,
      default: false,
    },
    notifications: [
      {
        body: {
          type: String,
          required: true, // The main content of the notification
        },
        link: {
          type: String, // A URL or path for users to take action or view details
        },
        date: {
          type: Date,
          default: Date.now, // Timestamp when the notification was created
        },
        seen: {
          type: Boolean,
          default: false, // Indicates if the user has seen the notification
        },
        tags: {
          type: [String], // Array of strings to allow multiple tags
          enum: [
            "urgent", 
            "personal", 
            "informational", 
            "promotional", 
            "system", 
            "birthday", 
            "holiday", 
            "special_offer", 
            "reminder", 
            "payment_due", 
            "booking_update", 
            "new_message", 
            "feedback_request", 
            "itinerary_change", 
            "flight_update", 
            "hotel_booking", 
            "travel_alert", 
            "success", 
            "failure", 
            "warning", 
            "info", 
            "product", // New tag
            "activity" // New tag
          ],
          default: [], // Default to an empty array if no tags are provided
        }
        ,
        
        type: {
          type: String,
          enum: ["birthday", "payment", "alert", "offer", "reminder"], // The general category of the notification
          required: true,
        },
        title: {
          type: String,
          required: true, // Short title or headline for the notification
        },
        priority: {
          type: String,
          enum: ["low", "medium", "high"], // Priority level of the notification
          default: "medium",
        },
      },
    ],
    hasUnseenNotifications: { type: Boolean, default: true },
    files: {
      IDFilename: {
        type: String,
        required: true,
      },
      certificatesFilenames: {
        type: [String],
        required: true,
      },
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
  },
  { timestamps: true }
);

tourGuideSchema.pre("save", async function (next) {
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

tourGuideSchema.statics.login = async function (username, password) {
  let tourGuide = await this.findOne({ username });
  if (tourGuide === null || tourGuide === undefined) {
    tourGuide = await this.findOne({ email: username });
  }
  if (tourGuide) {
    const auth = await bcrypt.compare(password, tourGuide.password);
    if (auth) {
      if (tourGuide.isAccepted === false) {
        throw Error("Your account is not accepted yet");
      }
      return tourGuide;
    }
    throw Error("Incorrect password");
  }
  throw Error("Email/Username is not registered");
};

tourGuideSchema.methods.addRating = async function (newRating) {
  // Calculate the new average rating based on all current ratings in comments plus the new rating
  const totalRatings = this.comments.length + 1; // Account for the new rating
  const sumOfRatings =
    this.comments.reduce((sum, comment) => sum + comment.rating, 0) + newRating;
  const averageRating = sumOfRatings / totalRatings;

  // Update only the average rating
  const updatedTourGuide = await this.constructor.findByIdAndUpdate(
    this._id,
    {
      rating: averageRating, // Update the average rating only
    },
    { new: true, runValidators: true } // Return the updated document
  );

  return updatedTourGuide.rating; // Return the new average rating
};

tourGuideSchema.methods.addComment = async function (comment) {
  // Add the new comment to the comments array
  this.comments.push(comment);

  // Save the updated activity document
  await this.save({ validateBeforeSave: false });

  return this.comments; // Return the updated comments array
};

tourGuideSchema.methods.comparePassword = async function (password, hash) {
  const auth = await bcrypt.compare(password, hash);
  if (auth) {
    return true;
  }
  return false;
};

const TourGuide = mongoose.model("TourGuide", tourGuideSchema);
module.exports = TourGuide;
