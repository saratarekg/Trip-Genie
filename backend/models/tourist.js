const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Schema = mongoose.Schema;
const Currency = require("./currency");

const getDefaultCurrency = async () => {
  const defaultCurrency = await Currency.findOne({ code: "EGP" });
  return defaultCurrency ? defaultCurrency._id : null; // Return the default currency ID or null
};

const touristSchema = new Schema(
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
    mobile: {
      type: String,
      required: true,
      trim: true,
      match: [
        /^\+\d{1,3}\d{7,15}$/,
        "Please enter a valid phone number with a country code and 7 to 15 digits.",
      ],
    },
    nationality: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Nationality",
      required: true,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
      immutable: true,
    },
    jobOrStudent: {
      type: String,
      required: true,
      trim: true,
    },
    preferredCurrency: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Currency",
      default: null,
    },
    wallet: {
      type: Number,
      default: 0,
    },
    loyaltyPoints: {
      type: Number,
      default: 0,
    },
    totalPoints: {
      type: Number,
      default: 0,
    },
    loyaltyBadge: {
      type: String,
      enum: ["Bronze", "Silver", "Gold"],
    },
    preference: {
      budget: {
        type: Number,
        default: Infinity, // Default value set to Infinity
      },
      price: {
        type: Number,
        default: Infinity, // Default value set to Infinity
      },
      categories: {
        type: [String],
        default: [], // Default to an empty array for categories
      },
      tourLanguages: {
        type: [String],
        default: [], // Default to an empty array for tour languages
      },
      tourType: {
        type: [String],
        default: [], // Default to an empty array for tour types
      },
      historicalPlaceType: {
        type: [String],
        default: [], // Default to an empty array for historical place types
      },
      historicalPlacePeriod: {
        type: [String],
        default: [], // Default to an empty array for historical place periods
      },
    },
  },
  { timestamps: true }
);

touristSchema.pre("save", async function (next) {
  if (!this.preferredCurrency) {
    this.preferredCurrency = await getDefaultCurrency(); // Fetch the default currency
  }

  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

touristSchema.statics.login = async function (username, password) {
  let tourist = await this.findOne({ username });
  if (tourist === null || tourist === undefined) {
    tourist = await this.findOne({ email: username });
  }

  if (tourist) {
    const auth = await bcrypt.compare(password, tourist.password);
    if (auth) {
      return tourist;
    }
    throw Error("Incorrect password");
  }
  throw Error("Email/Username is not registered");
};

touristSchema.methods.comparePassword = async function (password, hash) {
  const auth = await bcrypt.compare(password, hash);
  if (auth) {
    return true;
  }
  return false;
};

const Tourist = mongoose.model("Tourist", touristSchema);
module.exports = Tourist;
