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
    fname: {
      type: String,
      trim: true,
    },
    lname: {
      type: String,
      trim: true,
    },
    profilePicture: {
      public_id: { type: String },
      url: { type: String },
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
    cart: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true, min: 1 },
        totalPrice: { type: Number, required: true },
      },
    ],
    wishlist: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
      },
    ],

    cards: [
      {
        cardType: {
          type: String,
          required: true,
          enum: ["Credit Card", "Debit Card"],
        },
        cardNumber: {
          type: String,
          required: function () {
            return (
              this.cardType === "Credit Card" || this.cardType === "Debit Card"
            );
          },
          match: [/^[0-9]{16}$/, "Please enter a valid 16-digit card number"],
        },
        expiryDate: {
          type: String,
          required: function () {
            return (
              this.cardType === "Credit Card" || this.cardType === "Debit Card"
            );
          },
          match: [
            /^(0[1-9]|1[0-2])\/[0-9]{2}$/,
            "Please enter a valid expiry date in MM/YY format",
          ],
          validate: {
            validator: function (v) {
              const [month, year] = v.split("/");
              const expiryDate = new Date(`20${year}`, month - 1);
              const currentDate = new Date();
              currentDate.setDate(1);
              return expiryDate > currentDate;
            },
            message: "Expiry date must be in the future",
          },
        },
        holderName: {
          type: String,
          required: function () {
            return (
              this.cardType === "Credit Card" || this.cardType === "Debit Card"
            );
          },
          trim: true,
        },
        cvv: {
          type: String,
          required: function () {
            return (
              this.cardType === "Credit Card" || this.cardType === "Debit Card"
            );
          },
          match: [/^[0-9]{3,4}$/, "Please enter a valid 3 or 4 digit CVV"],
        },
        default: {
          type: Boolean,
          default: false,
        },
      },
    ],
    preference: {
      budget: {
        // max price
        type: Number,
        default: Infinity, // Default value set to Infinity
      },
      price: {
        // min price
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
    },
    shippingAddresses: [
      {
        streetName: {
          type: String,
          trim: true,
        },
        streetNumber: {
          type: String,
          trim: true,
        },
        floorUnit: {
          type: String,
          trim: true,
        },
        city: {
          type: String,
          trim: true,
        },
        state: {
          type: String,
          trim: true,
        },
        country: {
          type: String,
          trim: true,
        },
        postalCode: {
          type: String,
          trim: true,
        },
        landmark: {
          type: String,
          trim: true,
        },
        locationType: {
          type: String,
          enum: [
            "home",
            "work",
            "apartment",
            "friend_family",
            "po_box",
            "office",
            "pickup_point",
            "vacation",
            "school",
            "other",
          ],
          default: "home",
        },
        default: {
          type: Boolean,
          default: false,
        },
      },
    ],
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
