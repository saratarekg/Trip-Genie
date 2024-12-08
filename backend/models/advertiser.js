const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Schema = mongoose.Schema;

const advertiserSchema = new Schema(
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
    },
    description: {
      type: String,
      required: false,
    },
    website: {
      type: String,
      required: false,
    },
    hotline: {
      type: String,
      required: true,
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
            "alert",
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
            "activity",
            "inappropriate", // New tag
          ],
          default: [], // Default to an empty array if no tags are provided
        },
        type: {
          type: String,
          enum: ["birthday", "payment", "alert", "offer", "reminder"], // The general category of the notification
        },
        title: {
          type: String,
        },
        priority: {
          type: String,
          enum: ["low", "medium", "high"], // Priority level of the notification
          default: "medium",
        },
      },
    ],
    hasUnseenNotifications: { type: Boolean, default: false },
    logo: {
      public_id: { type: String },
      url: { type: String },
    },
    isAccepted: {
      type: Boolean,
      default: false,
    },
    files: {
      IDFilename: {
        type: String,
        required: true,
      },
      taxationRegistryCardFilename: {
        type: String,
        required: true,
      },
    },
  },
  { timestamps: true }
);

advertiserSchema.pre("save", async function (next) {
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

advertiserSchema.statics.login = async function (username, password) {
  let advertiser = await this.findOne({ username });
  if (advertiser === null || advertiser === undefined) {
    advertiser = await this.findOne({ email: username });
  }
  if (advertiser) {
    const auth = await bcrypt.compare(password, advertiser.password);
    if (auth) {
      if (advertiser.isAccepted === false) {
        throw Error("Your account is not accepted yet");
      }
      return advertiser;
    }
    throw Error("Incorrect password");
  }
  throw Error("Email/Username is not registered");
};

advertiserSchema.methods.comparePassword = async function (password, hash) {
  const auth = await bcrypt.compare(password, hash);
  if (auth) {
    return true;
  }
  return false;
};

const Advertiser = mongoose.model("Advertiser", advertiserSchema);
module.exports = Advertiser;
