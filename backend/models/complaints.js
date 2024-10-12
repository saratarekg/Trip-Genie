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
  tourist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tourist", 
    required: true,
  }
  
},
{
  timestamps: true,
}
);

module.exports = mongoose.model("Complaint", complaintSchema);
