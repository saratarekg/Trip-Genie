const mongoose = require("mongoose");

const touristFlightSchema = new mongoose.Schema(
  {
    touristID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tourist",
      required: true,
    },
    paymentType: {
      type: String,
      enum: ["CreditCard", "DebitCard", "Wallet"],
      required: true,
    },
    flightID: 
      {
        type: String,
        required: true,
      }
    , 
    from : {
      type: String,
      required: true,
    },
    to : {
      type: String,
      required: true,
    },
    departureDate : {
      type: Date,
      required: true,
    },
    arrivalDate : {
      type: Date,
      required: true,
    },
    price : {
      type: Number,
      required: true,
    },
    numberOfTickets : {
      type: Number,
      required: true,
    },
    type : {
      enum : ['Round Trip', 'One Way'],
      type : String,
      required : true,
    }, 
    returnDepartureDate : {
      type: Date,
    },
    returnArrivalDate : {
      type: Date,
    },
    seatType : {
      enum: ["Economy", "Business", "First Class"],
      type: String, 
      required : true
    }, 

    flightType :{
      type: String, 
      required : true
    },

    flightTypeReturn : {
      type: String, 
    }

  },
  { timestamps: true }
);

const TouristFlight = mongoose.model("TouristFlight", touristFlightSchema);
module.exports = TouristFlight;

