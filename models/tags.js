const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const tagSchema = new Schema({
  type: String,
  enum: [
    "historic areas",
    "beaches",
    "family-friendly",
    "shopping",
    "budget-friendly",
  ],
  required: true,
});

module.exports = mongoose.model('Tag', tagSchema)


