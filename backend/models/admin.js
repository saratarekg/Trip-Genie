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
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 8,
      match: [
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/,
        "Password must contain at least 8 characters, including at least one uppercase letter, one lowercase letter, one number",
      ],
    },
  },
  { timestamps: true }
);

adminSchema.pre("save", async function (next) {
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

adminSchema.statics.login = async function (username, password) {
  const admin = await this.findOne({ username });
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
