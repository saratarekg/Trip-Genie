const mongoose = require("mongoose");
const AutoIncrement = require('mongoose-sequence')(mongoose);

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
  number: { // New auto-incremented field
    type: Number,
  }
}, {
  timestamps: true,
});

// Apply the auto-increment plugin to the 'number' field
complaintSchema.plugin(AutoIncrement, { inc_field: 'number', start_seq: 1 });

module.exports = mongoose.model("Complaint", complaintSchema);
