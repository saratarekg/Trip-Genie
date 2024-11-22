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
    notifications: [{
      body: {
        type: String,
      },
      date: {
        type: Date,
        default: Date.now,
      },
      seen: {
        type: Boolean,
        default: false,
      }
    }],
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
