const ActivityBooking = require("../models/activityBooking"); // Assuming your model is in models/activityBooking.js
const Activity = require("../models/activity"); // Assuming your Activity model is in models/activity.js
const Tourist = require("../models/tourist"); // Assuming your Tourist model is in models/tourist.js
const Currency = require("../models/currency");
const CurrencyRates = require("../models/currencyRate");
const PromoCode = require("../models/promoCode");
const emailService = require("../services/emailService");

// Create a new booking
exports.createBooking = async (req, res) => {
  try {
    const userId = res.locals.user_id; // Get the user's ID from response locals
    const { paymentType, paymentAmount, activity, numberOfTickets, promoCode } =
      req.body;

    // Check if the activity exists
    const activityExists = await Activity.findById(activity);
    const user = await Tourist.findById(userId); // Get the user details, including wallet balance

    if (!activityExists) {
      return res.status(400).json({ message: "Activity not found" });
    }

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    let usedPromoCode = null;
    if (promoCode) {
      try {
        usedPromoCode = await PromoCode.usePromoCode(promoCode);
      } catch (error) {
        // If there's an error with the promo code, we'll just log it and continue without applying a discount
        console.error(`Promo code error: ${error.message}`);
      }
    }

    let walletBalance = 0;
    let finalPaymentAmount = paymentAmount;

    // Apply promo code discount if available
    if (usedPromoCode) {
      const discount = (usedPromoCode.percentOff / 100) * paymentAmount;
      finalPaymentAmount = paymentAmount - discount;
    }

    // Check if payment type is "Wallet"
    if (paymentType === "Wallet") {
      if (user.wallet < finalPaymentAmount) {
        return res
          .status(400)
          .json({ message: "Insufficient funds in wallet" });
      }

      walletBalance = user.wallet - finalPaymentAmount;
    }

    // Create a new booking
    const newBooking = new ActivityBooking({
      activity,
      paymentType,
      paymentAmount: finalPaymentAmount,
      numberOfTickets,
      user: userId,
      promoCode: usedPromoCode ? usedPromoCode : null,
    });

    await newBooking.save();

    const currency = (await Currency.findOne({
      _id: user.preferredCurrency,
    })) || { code: "USD" };
    const rates = await CurrencyRates.findOne();
    const exchangeRate = rates.rates.get(currency.code);
    const paymentAmountExchanged = newBooking.paymentAmount * exchangeRate;

    await emailService.sendActivityBookingConfirmationEmail(
      user.email,
      newBooking,
      activityExists,
      paymentAmountExchanged
    );

    // Calculate loyalty points based on the user's badge level
    const loyaltyPoints = calculateLoyaltyPoints(
      finalPaymentAmount,
      user.loyaltyBadge
    );

    // Update total points and loyalty points using findByIdAndUpdate
    const totalPoints = user.totalPoints + loyaltyPoints; // Calculate total points

    // Update the tourist's record in the database
    const updateFields = {
      $inc: {
        totalPoints: loyaltyPoints, // Increment total points
        loyaltyPoints: loyaltyPoints, // Increment current loyalty points
      },
      loyaltyBadge: determineBadgeLevel(totalPoints), // Update loyalty badge based on total points
    };

    // Conditionally add wallet balance and history only for wallet payments
    if (paymentType === "Wallet") {
      updateFields.wallet = walletBalance; // Update wallet balance
      updateFields.$push = {
        history: {
          transactionType: "payment",
          amount: finalPaymentAmount,
          details: `You’ve successfully booked activity ${activityExists.name}`,
        },
      };
    }

    const updatedTourist = await Tourist.findByIdAndUpdate(
      userId,
      updateFields,
      { new: true, runValidators: true } // Ensure it returns the updated tourist
    );

    if (!updatedTourist) {
      return res.status(404).json({ message: "Tourist not found" });
    }

    // Respond with the updated booking and tourist profile
    res.status(201).json({
      message: "Booking created successfully",
      booking: newBooking,
      walletBalance: walletBalance, // Include the new wallet balance
      pricePaid: finalPaymentAmount, // Include the price paid with promo code discount if available
      percentageOff: usedPromoCode ? usedPromoCode.percentOff : 0,
      loyaltyPoints,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message, error });
  }
};

// Function to calculate loyalty points based on badge level
const calculateLoyaltyPoints = (paymentAmount, badgeLevel) => {
  let pointsMultiplier = 0;

  // Determine points multiplier based on badge level
  switch (badgeLevel) {
    case "Bronze":
      pointsMultiplier = 0.5; // 50% of amount paid
      break;
    case "Silver":
      pointsMultiplier = 1.0; // 100% of amount paid
      break;
    case "Gold":
      pointsMultiplier = 1.5; // 150% of amount paid
      break;
    default:
      pointsMultiplier = 0; // No points if badge level is unrecognized
      break;
  }

  // Calculate and return the loyalty points
  return paymentAmount * pointsMultiplier;
};

// Function to determine badge level based on total points
const determineBadgeLevel = (totalPoints) => {
  if (totalPoints <= 100000) {
    return "Bronze";
  } else if (totalPoints <= 500000) {
    return "Silver";
  } else {
    return "Gold";
  }
};

// Get all bookings
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await ActivityBooking.find()
      .populate("activity") // Populate activity details
      .populate("user"); // Populate user details

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get a specific booking by ID
exports.getBookingById = async (req, res) => {
  try {
    const booking = await ActivityBooking.findById(req.params.id)
      .populate("activity")
      .populate("user");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Update a booking
exports.updateBooking = async (req, res) => {
  try {
    const updatedBooking = await ActivityBooking.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )
      .populate("activity")
      .populate("user");

    if (!updatedBooking) {
      return res.status(400).json({ message: "Booking not found" });
    }

    res.status(200).json(updatedBooking);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Delete a booking
exports.deleteBooking = async (req, res) => {
  try {
    // Step 1: Find the booking
    const booking = await ActivityBooking.findById(req.params.id).populate(
      "activity"
    ); // Populate the activity field
    if (!booking) {
      return res.status(400).json({ message: "Booking not found" });
    }

    // Ensure the activity exists within the booking
    if (!booking.activity) {
      return res
        .status(400)
        .json({ message: "Activity details not found for the booking" });
    }

    // Step 2: Add the booking amount to the tourist's wallet
    const touristId = res.locals.user_id; // Assuming 'tourist' is a reference in the booking schema
    const bookingAmount = booking.paymentAmount; // Assuming 'paymentAmount' is the field for booking cost

    const updatedTourist = await Tourist.findByIdAndUpdate(
      touristId,
      {
        $inc: { wallet: bookingAmount }, // Increment the wallet balance by the booking amount (Refund)
        $push: {
          history: {
            transactionType: "deposit", // Mark it as a deposit
            amount: bookingAmount, // The amount refunded
            details: `Refunded for Cancelling Activity: ${booking.activity.name}`, // Details of the refund
          },
        },
      },
      { new: true, runValidators: true } // Return updated tourist and run validations
    );

    if (!updatedTourist) {
      return res.status(400).json({ message: "Tourist not found" });
    }

    // Step 3: Delete the booking after wallet update
    const deletedBooking = await ActivityBooking.findByIdAndDelete(
      req.params.id
    );
    if (!deletedBooking) {
      return res.status(400).json({ message: "Booking not found" });
    }

    res.status(200).json({
      message: "Booking deleted successfully and amount refunded",
      wallet: updatedTourist.wallet,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.getTouristBookings = async (req, res) => {
  try {
    console.log(1);
    const touristId = res.locals.user_id; // Get the user's ID from response locals
    const bookings = await ActivityBooking.getBookingsForTourist(touristId); // Fetch all bookings for the tourist
    console.log(2);

    // Filter out bookings with activity dates that have passed
    const upcomingBookings = bookings.filter((booking) => {
      // Check if the activity exists
      const activity = booking.activity;
      if (!activity) {
        return false; // Exclude if activity doesn't exist
      }

      const activityDate = activity.timing; // Access timing only if activity exists

      // Check if timing exists and is not a string
      if (activityDate && typeof activityDate !== "string") {
        // Determine if activityDate is a valid Date object or needs conversion
        const dateToCheck =
          activityDate instanceof Date ? activityDate : new Date(activityDate);
        return dateToCheck > new Date(); // Check if the activity date is in the future
      }

      // Exclude bookings where timing is a string or undefined
      return false;
    });

    if (!upcomingBookings || upcomingBookings.length === 0) {
      return res.status(200).json([]); // Return an empty array if no upcoming bookings found
    }
    console.log(3);

    res.status(200).json(upcomingBookings); // Return the found upcoming bookings
  } catch (error) {
    console.error("Error occurred:", error); // Print the error to the console
    res.status(500).json({ message: error.message }); // Handle any errors
  }
};

exports.getTouristAttendedBookings = async (req, res) => {
  try {
    const touristId = res.locals.user_id; // Get the user's ID from response locals

    // Fetch all bookings for this tourist
    const bookings = await ActivityBooking.find({ user: touristId }).populate(
      "activity"
    );

    // Filter out bookings with activity dates in the future
    const pastBookings = bookings.filter((booking) => {
      // Check if the activity exists
      const activity = booking.activity;
      if (!activity) {
        return false; // Exclude if activity doesn't exist
      }

      const activityDate = activity.timing; // Access timing only if activity exists

      // Check if timing exists and is not a string
      if (activityDate && typeof activityDate !== "string") {
        // Determine if activityDate is a valid Date object or needs conversion
        const dateToCheck =
          activityDate instanceof Date ? activityDate : new Date(activityDate);
        return dateToCheck <= new Date(); // Check if the activity date is in the future
      }

      // Exclude bookings where timing is a string or undefined
      return false;
    });

    if (!pastBookings || pastBookings.length === 0) {
      return res.status(200).json([]); // Return an empty array if no past bookings found
    }

    res.status(200).json(pastBookings); // Return the found past bookings
  } catch (error) {
    res.status(500).json({ message: error.message }); // Handle any errors
  }
};

// exports.getBookingsReport = async (req, res) => {
//   try {
//     const { startDate, endDate, month, year } = req.query; // Get the month from the query string
//     let selectedActivities = req.query.selectedActivities; // Get the selected activities from the query string
//     const advertiserId = res.locals.user_id; // Get the user's ID from response locals
//     const activities = await Activity.find({ advertiser: advertiserId });
//     let activityIds = activities.map((activity) => activity._id);
//     if (selectedActivities) {
//       selectedActivities = selectedActivities.split(",");
//       activityIds = activityIds.filter((activityId) =>
//         selectedActivities.includes(activityId.toString())
//       );
//     }

//     let bookings;
//     if (startDate && endDate) {
//       bookings = await ActivityBooking.find({
//         activity: { $in: activityIds },
//         createdAt: { $gte: startDate, $lte: endDate },
//       }).populate("activity");
//     } else if (month && year) {
//       const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
//       const endDate = new Date(parseInt(year), parseInt(month), 0);
//       bookings = await ActivityBooking.find({
//         activity: { $in: activityIds },
//         createdAt: { $gte: startDate, $lte: endDate },
//       }).populate("activity");
//     } else {
//       bookings = await ActivityBooking.find({
//         activity: { $in: activityIds },
//       }).populate("activity");
//     }

//     let totalRevenue = 0;
//     let totalTickets = 0;

//     // Calculate total number of tickets for each activity
//     const activityReport = activities.map((activity) => {
//       const tickets = bookings.reduce((total, booking) => {
//         return booking.activity._id.toString() === activity._id.toString()
//           ? total + booking.numberOfTickets
//           : total;
//       }, 0);

//       // Calculate total revenue for each activity
//       const revenue = bookings.reduce((total, booking) => {
//         return booking.activity._id.toString() === activity._id.toString()
//           ? total + booking.paymentAmount
//           : total;
//       }, 0);

//       totalRevenue += revenue; // Add revenue to total revenue
//       totalTickets += tickets; // Add tickets to total tickets

//       return {
//         activity,
//         tickets,
//         revenue: revenue * 0.9, // 10% commission for the platform
//       };
//     });

//     totalRevenue *= 0.9; // 10% commission for the platform
//     res.status(200).json({ activityReport, totalRevenue, totalTickets });
//   } catch (error) {
//     res.status(500).json({ message: error.message }); // Handle errors
//   }
// };

exports.getBookingsReport = async (req, res) => {
  try {
    const { day, month, year } = req.query; // Get the month from the query string
    let selectedActivities = req.query.selectedActivities; // Get the selected activities from the query string
    const advertiserId = res.locals.user_id; // Get the user's ID from response locals
    let activities = await Activity.find({ advertiser: advertiserId });
    if (selectedActivities) {
      selectedActivities = selectedActivities.split(",");
      activities = activities.filter((activity) =>
        selectedActivities.includes(activity._id.toString())
      );
    }
    const activityIds = activities.map((activity) => activity._id);

    const query = { activity: { $in: activityIds } };
    if (day && month && year) {
      const startDate = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day)
      );
      const endDate = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day) + 1
      );
      query.createdAt = { $gte: startDate, $lt: endDate };
    } else if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 1);
      query.createdAt = { $gte: startDate, $lt: endDate };
    } else if (year) {
      const startDate = new Date(parseInt(year), 0, 1);
      const endDate = new Date(parseInt(year) + 1, 0, 1);
      query.createdAt = { $gte: startDate, $lt: endDate };
    }

    const bookings = await ActivityBooking.find(query).populate("activity");

    let totalRevenue = 0;
    let totalTickets = 0;

    // Calculate total number of tickets for each activity
    let activityReport = activities.map((activity) => {
      const tickets = bookings.reduce((total, booking) => {
        return booking.activity._id.toString() === activity._id.toString()
          ? total + booking.numberOfTickets
          : total;
      }, 0);

      // Calculate total revenue for each activity
      const revenue = bookings.reduce((total, booking) => {
        return booking.activity._id.toString() === activity._id.toString()
          ? total + booking.paymentAmount
          : total;
      }, 0);

      totalRevenue += revenue; // Add revenue to total revenue
      totalTickets += tickets; // Add tickets to total tickets

      return {
        activity,
        tickets,
        revenue: revenue * 0.9, // 10% commission for the platform
      };
    });

    totalRevenue *= 0.9; // 10% commission for the platform
    if (year) {
      activityReport = activityReport.filter((report) => report.tickets > 0);
    }
    activityReport = activityReport.sort((a, b) => b.revenue - a.revenue);
    res.status(200).json({ activityReport, totalRevenue, totalTickets });
  } catch (error) {
    res.status(500).json({ message: error.message }); // Handle errors
  }
};

exports.getMyCurrentActivities = async (req, res) => {
  try {
    const activities = await ActivityBooking.find({
      user: res.locals.user_id,
    }).populate("activity");

    const now = new Date();
    const currentActivities = activities.filter((activity) => {
      const startTime = new Date(activity.activity.timing);
      const durationInMilliseconds =
        activity.activity.duration * 60 * 60 * 1000; // Convert hours to milliseconds
      const endTime = new Date(startTime.getTime() + durationInMilliseconds);
      console.log(startTime, endTime);
      console.log(now);
      return startTime < now && now < endTime;
    });
    console.log(currentActivities);

    res.status(200).json(currentActivities);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
};

exports.getMyPastActivities = async (req, res) => {
  try {
    const activities = await ActivityBooking.find({
      user: res.locals.user_id,
    }).populate("activity");

    const now = new Date();
    const pastActivities = activities.filter((activity) => {
      const startTime = new Date(activity.activity.timing);
      const durationInMilliseconds =
        activity.activity.duration * 60 * 60 * 1000; // Convert hours to milliseconds
      const endTime = new Date(startTime.getTime() + durationInMilliseconds);
      return endTime < now;
    });

    res.status(200).json(pastActivities);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
};
