const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentSchema = new Schema(
  {
    username: {
      type: String,
      required: true, // Assuming username is required
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      required: true, // Assuming rating is required
    },
    content: {
      type: String,
      required: true, // Assuming comment is required
    },
    activityID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Activity", // Reference to the Activity model
      required: true,
    },
  },
  { timestamps: true }
);

// Register the model
const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
