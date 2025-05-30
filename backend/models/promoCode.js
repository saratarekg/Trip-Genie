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
    type: {
      type: String,
      required: true,
      enum: ["birthday", "general"],
    },
    usage_limit: {
      type: Number,
      required: true,
      min: [1, "Usage limit must be at least 1"],
    },

    timesUsed: {
      type: Number,
      default: 0,
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

// Method to check and update the status of the promo code
promoCodeSchema.methods.checkStatus = function () {
  const now = new Date();
  if (this.dateRange.end < now) {
    this.status = "expired";
  } else if (this.timesUsed >= this.usage_limit) {
    this.status = "inactive";
  } else {
    this.status = "active";
  }
};

// Static function to use a promo code
promoCodeSchema.statics.usePromoCode = async function (code) {
  const promo = await this.findOne({ code });

  if (!promo) {
    throw new Error("Promo code not found");
  }

  // Check and update status
  promo.checkStatus();
  if (promo.status !== "active") {
    throw new Error(`Promo code is ${promo.status}`);
  }

  // Increment timesUsed and recheck status
  promo.timesUsed += 1;
  promo.checkStatus();
  await promo.save();

  return promo;
};

const PromoCode = mongoose.model("PromoCode", promoCodeSchema);

module.exports = PromoCode;
