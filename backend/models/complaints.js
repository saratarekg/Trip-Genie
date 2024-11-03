const mongoose = require("mongoose");
const AutoIncrement = require('mongoose-sequence')(mongoose);

// Create a sub-schema for replies
const replySchema = new mongoose.Schema({
  content: {
    type: String, // The reply content
    required: true,
  }
}, {
  timestamps: true // Enable timestamps for replies (adds createdAt and updatedAt)
});

// Main Complaint Schema
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
  tourist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tourist",
    required: true,
  },
  number: { // Auto-incremented field
    type: Number,
  },
  replies: [replySchema], // Use the reply schema with timestamps
}, {
  timestamps: true, // Timestamps for the complaint itself
});

// Apply the auto-increment plugin to the 'number' field
complaintSchema.plugin(AutoIncrement, { inc_field: 'number', start_seq: 1 });

module.exports = mongoose.model("Complaint", complaintSchema);
