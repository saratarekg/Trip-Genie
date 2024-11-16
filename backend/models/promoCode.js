const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const promoCodeSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      minlength: [3, "Code must be at least 3 characters long"],
    },
    status: {
      type: String,
      required: true,
      enum: ["active", "inactive", "expired"],
      default: "active",
    },
    percentOff: {
      type: Number,
      required: true,
      min: [0, "Discount must be at least 0%"],
      max: [100, "Discount cannot exceed 100%"],
    },

    usage_limit: {
      type: Number,
      required: true,
      min: [1, "Usage limit must be at least 1"],
    },

    dateRange: {
      start: {
        type: Date,
        required: true,
      },
      end: {
        type: Date,
        required: true,
        validate: {
          validator: function (value) {
            return value > this.dateRange.start;
          },
          message: "End date must be after the start date",
        },
      },
    },
  },
  { timestamps: true }
);


const PromoCode = mongoose.model("PromoCode", promoCodeSchema);
module.exports = PromoCode;
