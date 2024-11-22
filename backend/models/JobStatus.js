const mongoose = require("mongoose");

const JobStatusSchema = new mongoose.Schema({
  jobName: {
    type: String,
    required: true,
    unique: true, // Ensure jobName is unique for each job
  },
  lastRun: {
    type: Date,
    required: true,
    default: Date.now, // Set the current time as default
  },
  status: {
    type: String,
    enum: ["success", "failed"], // Track the last job run's status
    default: "success",
  },
  error: {
    type: String, // Log any error message from the last job run
    default: null,
  },
});

module.exports = mongoose.model("JobStatus", JobStatusSchema);
