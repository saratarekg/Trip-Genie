const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "resolved"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: Date,
  tourist: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'tourist', // Assuming Tourist is the name of your tourist/user model
    required: true,
  },
});

module.exports = mongoose.model("Complaint", complaintSchema);
