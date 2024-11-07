const mongoose = require("mongoose");

const touristTransportationSchema = new mongoose.Schema(
  {
    touristID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tourist", // Reference to the Tourist model
      required: true,
    },
    transportationID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transportation", // Reference to the Transportation model
      required: true,
    }
  },
  { timestamps: true }
);

const TouristTransportation = mongoose.model("TouristTransportation", touristTransportationSchema);
module.exports = TouristTransportation;
