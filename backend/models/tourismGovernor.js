const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Schema = mongoose.Schema;

const tourismGovernorSchema = new Schema(
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
  },
  { timestamps: true }
);

tourismGovernorSchema.pre("save", async function (next) {
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

tourismGovernorSchema.statics.login = async function (username, password) {
  let tourismGovernor = await this.findOne({ username });
  if (tourismGovernor === null || tourismGovernor === undefined) {
    tourismGovernor = await this.findOne({ email: username });
  }

  if (tourismGovernor) {
    const auth = await bcrypt.compare(password, tourismGovernor.password);
    if (auth) {
      return tourismGovernor;
    }
    throw Error("Incorrect password");
  }
  throw Error("Username is not registered");
};

tourismGovernorSchema.methods.comparePassword = async function (
  password,
  hash
) {
  const auth = await bcrypt.compare(password, hash);
  if (auth) {
    return true;
  }
  return false;
};

const TourismGovernor = mongoose.model(
  "TourismGovernor",
  
  tourismGovernorSchema
);
module.exports = TourismGovernor;
