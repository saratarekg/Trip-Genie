const mongoose = require("mongoose");

const touristTransportationSchema = new mongoose.Schema(
  {
    touristID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tourist",
      required: true,
    },
    transportationID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transportation",
      required: true,
    },
    seatsBooked: {
      type: Number,
      required: true,
    },
    totalCost: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const TouristTransportation = mongoose.model("TouristTransportation", touristTransportationSchema);
module.exports = TouristTransportation;
