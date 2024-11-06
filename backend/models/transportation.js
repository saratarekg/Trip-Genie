const mongoose = require("mongoose");

const transportationSchema = new mongoose.Schema(
  {
    from: {
      type: String,
      required: true,
    },
    to: {
      type: String,
      required: true,
    },
    vehicleType: {
      type: String,
      enum: ["bus", "microbus", "car"],
      required: true,
    },
    ticketCost: {
      type: Number,
      required: true,
      min: 0,
    },
    timeDeparture: {
      type: Date,
      required: true,
    },
    estimatedDuration: {
      type: Number,
      required: true,
      min: 1, // Assuming duration can't be less than 1 hour
    },
    remainingSeats: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
  },
  { timestamps: true }
);

const Transportation = mongoose.model("Transportation", transportationSchema);
module.exports = Transportation;
