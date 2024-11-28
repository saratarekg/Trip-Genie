const mongoose = require("mongoose");
const Seller = require("./seller");
const Admin = require("./admin");
const emailService = require("../services/emailService");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    pictures: [
      {
        public_id: { type: String, required: true },
        url: { type: String, required: true },
      },
    ],
    price: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller", // Reference to the Seller schema
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    allRatings: [
      {
        type: Number,
        min: 0,
        max: 5,
        default: 0,
      },
    ],
    reviews: [
      {
        user: { type: String, required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String },
        date: { type: Date },
        tourist: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Tourist",
          required: true,
        },
      },
    ],
    quantity: {
      type: Number,
      required: true,
    },
    sales: {
      type: Number,
      default: 0,
    },
    currency: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Currency",
      required: true,
    },
    isArchived: {
      type: Boolean,
      required: true,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      required: true,
      default: false,
    },
  },

  { timestamps: true }
);

productSchema.statics.searchByNames = async function (name) {
  try {
    if (name === undefined || name === null || name === "") {
      return this.find().populate("seller").exec(); // Return all products if no name is provided
    }

    const products = await this.find({
      name: { $regex: new RegExp(name, "i") },
    });
    return products; // Return the products to be handled by the controller
  } catch (error) {
    throw new Error(error.message); // Throw the error to be caught by the calling function
  }
};

productSchema.statics.filterByPrice = async function (minPrice, maxPrice) {
  try {
    const priceFilter = {};

    if (minPrice !== undefined) {
      priceFilter.$gte = minPrice;
    }
    if (maxPrice !== undefined) {
      priceFilter.$lte = maxPrice;
    }

    let products;
    // If minPrice or maxPrice is provided, use the filter conditions
    if (Object.keys(priceFilter).length > 0) {
      products = await this.find({ price: priceFilter });
    } else {
      // If no price filters are provided, return all products
      products = await this.find();
    }

    if (!products || products.length === 0) {
      return res.status(200).json([]);
    }

    return products;
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// productSchema.post("save", async function (doc) {
//   console.log("Product out of stock4");

//   if (doc.quantity === 0) {
//     console.log("Product out of stock");

//     if (doc.seller === undefined || doc.seller === null) {
//       await Admin.updateMany({}, {
//         $push: {
//           notifications: {
//             body: `Product ${doc.name} is out of stock`
//           }
//         }
//       });

//     }
//     else {
//       await Seller.findByIdAndUpdate(
//         doc.seller,
//         {
//           $push: {
//             notifications: {
//               body: `Product ${doc.name} is out of stock`,
//             },
//           },
//         },
//         { new: true }
//       );

//       const seller = await Seller.findById(doc.seller);

//       const mailOptions = {
//         to: seller.email,
//         subject: "Product Out of Stock Notification",
//         html: `<h1>Product Out of Stock</h1>
//       <p>Dear ${seller.name},</p>
//       <p>We wanted to inform you that your product is currently out of stock:</p>
//       <p><strong>Product Name:</strong> ${doc.name}</p>
//       <p>Please update the stock availability in your dashboard this product.</p>
//       <p>Thank you for your attention.</p>
//       <p>Best regards,<br>Trip Genie</p>`,
//       };

//       transporter.sendMail(mailOptions, (error, info) => {
//         if (error) {
//           console.error("Email error: ", error.message);
//         }
//       });
//     }

//   }

// });

productSchema.post("findOneAndUpdate", async function (doc) {
  // if (!doc) {
  //   console.log("No document found for findOneAndUpdate hook.");
  //   return;
  // }
  if (doc.quantity === 0) {
    console.log("Product out of stock2");

    if (doc.seller === undefined || doc.seller === null) {
      await Admin.updateMany(
        {},
        {
          $push: {
            notifications: {
              tags: ["alert", "product", "out_of_stock"],
              title: "Product Out of Stock",
              priority: "high",
              type: "alert",
              body: `Product <b>${doc.name}</b> is out of stock.`,
              link: `/product/${doc._id}`,
            },
          },
          
        }
      );

      const admins = await Admin.find();
      admins.forEach(async (admin) => {
        await emailService.sendOutOfStockEmail(
          admin.email,
          admin.username,
          doc
        );
      });
    } else {
      await Seller.findByIdAndUpdate(
        doc.seller,
        {
          $push: {
            notifications: {
              tags: ["informational", "warning"], // Valid tags based on the enum
              title: "Product Out of Stock",
              priority: "high",
              type: "alert",
              body: `Product <b>${doc.name}</b> is out of stock.`,
              link: `/product/${doc._id}`,
            },
          },
          
        },
        { new: true }
      );

      const seller = await Seller.findById(doc.seller);

      await emailService.sendOutOfStockEmail(seller.email, seller.name, doc);
    }
  }
});

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
