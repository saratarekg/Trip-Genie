const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Schema = mongoose.Schema;

const adminSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      minlength: 3,
      match: [/^\S+$/, "Username should not contain spaces."],
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
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

  },
  { timestamps: true }
);

adminSchema.pre("save", async function (next) {
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

adminSchema.statics.login = async function (username, password) {
  let admin = await this.findOne({ username });
  if (admin === null || admin === undefined) {
    admin = await this.findOne({ email: username });
  }

  if (admin) {
    const auth = await bcrypt.compare(password, admin.password);
    if (auth) {
      return admin;
    }
    throw Error("Incorrect password");
  }
  throw Error("Username is not registered");
};

adminSchema.methods.comparePassword = async function (password, hash) {
  const auth = await bcrypt.compare(password, hash);
  if (auth) {
    return true;
  }
  return false;
};

const Admin = mongoose.model("Admin", adminSchema);
module.exports = Admin;
