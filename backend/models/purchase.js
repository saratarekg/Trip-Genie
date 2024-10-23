const mongoose = require("mongoose");

const purchaseSchema = new mongoose.Schema(
  {
    tourist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tourist", // Reference to the Tourist model (you will need to define this model)
      required: true,
    },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product", // Reference to the Product model
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1, // At least 1 product should be purchased
        },
      }
    ],
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: ["credit_card", "debit_card", "wallet", "cash_on_delivery"], // Only these values are allowed
      required: true,
    },
    purchaseDate: {
      type: Date,
      default: Date.now,
    },
    deliveryDate: {
      type: Date,
      required: false,
    },
    deliveryTime: {
      type: String,
      required: false,
    },
    deliveryType: {
      type: String,
      enum: ["Standard", "Express", "Next-Same", "International"],
      default: "Standard", // Only these values are allowed
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "delivered", "cancelled"], // Only these values are allowed
      default: "pending",
    },
    shippingAddress: {
      type: String,
      required: true,
    },
    locationType: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// Static method to find purchases by tourist ID
purchaseSchema.statics.findByTourist = async function (touristId) {
  try {
    const purchases = await this.find({ tourist: touristId })
      .populate("product")
      .exec();
    return purchases;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Static method to find purchases by product ID
purchaseSchema.statics.findByProduct = async function (productId) {
  try {
    const purchases = await this.find({ product: productId })
      .populate("tourist")
      .exec();
    return purchases;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = mongoose.model("Purchase", purchaseSchema);
