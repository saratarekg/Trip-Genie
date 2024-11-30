const mongoose = require("mongoose");

const touristHotelSchema = new mongoose.Schema(
  {
    touristID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tourist",
      required: true,
    },
    hotelID:
      {
        type: String,
        required: true,
      },
    hotelName: {
      type: String,
      required: true,
    },
    checkinDate: {
      type: Date,
      required: true,
    },
    checkoutDate: {
      type: Date,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    roomName: {
      type: String,
      required: true,
    },
    numberOfAdults: {
      type: Number,
      required: true,
    },
    numberOfRooms : {
      type: Number,
      required: true,
    },
    paymentType: {
      type: String,
      enum: ["CreditCard", "DebitCard", "Wallet"],
      required: true,
    },
  },
  { timestamps: true }
);

const TouristHotel = mongoose.model("TouristHotel", touristHotelSchema);
module.exports = TouristHotel;
