const ItineraryBooking = require("../models/itineraryBooking");
const Itinerary = require("../models/itinerary");
const Tourist = require("../models/tourist");
const Currency = require("../models/currency");
const CurrencyRates = require("../models/currencyRate");
const PromoCode = require("../models/promoCode");
const emailService = require("../services/emailService");

// Create a new itinerary booking
exports.createBooking = async (req, res) => {
  try {
    const userId = res.locals.user_id;
    const { itinerary, paymentType, paymentAmount, numberOfTickets, date, promoCode } =
      req.body;

    // Step 1: Check if the itinerary exists
    const itineraryExists = await Itinerary.findById(itinerary);
    const user = await Tourist.findById(userId); // Get the user details, including wallet balance

    if (!itineraryExists) {
      return res.status(400).json({ message: "Itinerary not found" });
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

    let walletBalance = user.wallet;

    // Apply promo code discount
    let finalPaymentAmount = paymentAmount;
    if (usedPromoCode) {
      finalPaymentAmount = paymentAmount - (paymentAmount * usedPromoCode.percentOff / 100);
    }

    // Step 2: Handle Wallet payment type
    if (paymentType === "Wallet") {
      if (walletBalance < finalPaymentAmount) {
        return res
          .status(400)
          .json({ message: "Insufficient funds in wallet" });
      }

      // Deduct the payment amount from the user's wallet
      walletBalance -= finalPaymentAmount;

      // Add a transaction to history for payment
    }

    // Step 3: Update itinerary's `isBooked` status
    await Itinerary.findByIdAndUpdate(
      itinerary,
      { isBooked: true },
      { new: true }
    );

    // Step 4: Create the booking
    const newBooking = new ItineraryBooking({
      itinerary,
      paymentType,
      paymentAmount: finalPaymentAmount,
      user: userId,
      numberOfTickets,
      date,
      promoCode: usedPromoCode ? usedPromoCode : null,
    });

    // Save the booking
    await newBooking.save();

    const currency = (await Currency.findOne({
      _id: user.preferredCurrency,
    })) || { code: "USD" };
    const rates = await CurrencyRates.findOne();
    const exchangeRate = rates.rates.get(currency.code);
    const paymentAmountExchanged = newBooking.paymentAmount * exchangeRate;

    // Send email confirmation
    await emailService.sendItineraryBookingConfirmationEmail(
      user.email,
      newBooking,
      itineraryExists,
      paymentAmountExchanged
    );

    // Step 5: Calculate loyalty points based on the user's badge level
    const loyaltyPoints = calculateLoyaltyPoints(
      finalPaymentAmount,
      user.loyaltyBadge
    );

    // Calculate total points after adding new loyalty points
    const totalPoints = user.totalPoints + loyaltyPoints;

    const updateFields = {
      $inc: {
        totalPoints: loyaltyPoints, // Increment total points
        loyaltyPoints: loyaltyPoints, // Increment current loyalty points
      },
      loyaltyBadge: determineBadgeLevel(totalPoints), // Update loyalty badge based on total points
    };

    // Conditionally add wallet balance and history only for wallet payments
    console.log(paymentType);

    if (paymentType === "Wallet") {
      console.log("gowa el if");

      updateFields.wallet = walletBalance; // Update wallet balance
      updateFields.$push = {
        history: {
          transactionType: "payment",
          amount: finalPaymentAmount,
          details: `You’ve successfully booked Itinerary ${itineraryExists.title}`,
        },
      };
    }

    const updatedTourist = await Tourist.findByIdAndUpdate(
      userId,
      updateFields,
      { new: true, runValidators: true } // Ensure it returns the updated tourist
    );

    if (!updatedTourist) {
      return res.status(400).json({ message: "Tourist not found" });
    }

    // Respond with the updated booking and tourist profile
    res.status(201).json({
      message: "Booking created successfully",
      booking: newBooking,
      percentageOff: usedPromoCode ? usedPromoCode.percentOff : 0,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      message: "Failed to create booking",
      error: error.message,
    });
  }
};

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
    const bookings = await ItineraryBooking.find()
      .populate("itinerary")
      .populate("user");
    res.status(200).json(bookings);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to retrieve bookings", error: error.message });
  }
};

// Get a booking by ID
exports.getBookingById = async (req, res) => {
  try {
    const booking = await ItineraryBooking.findById(req.params.id)
      .populate("itinerary")
      .populate("user");
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.status(200).json(booking);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to retrieve booking", error: error.message });
  }
};

// Update a booking by ID
exports.updateBooking = async (req, res) => {
  try {
    const updatedBooking = await ItineraryBooking.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.status(200).json({
      message: "Booking updated successfully",
      booking: updatedBooking,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update booking", error: error.message });
  }
};

// Delete a booking by ID
exports.deleteBooking = async (req, res) => {
  try {
    const booking = await ItineraryBooking.findById(req.params.id).populate(
      "itinerary"
    ); // Populate the activity field
    if (!booking) {
      return res.status(400).json({ message: "Booking not found" });
    }
    // Step 1: Find and delete the booking
    const deletedBooking = await ItineraryBooking.findByIdAndDelete(
      req.params.id
    );
    if (!deletedBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Step 2: Get the tourist's ID from the response locals and booking amount
    const touristId = res.locals.user_id; // Assuming 'tourist' is a reference in the booking schema
    const bookingAmount = deletedBooking.paymentAmount; // Amount that was refunded

    // Step 3: Find the tourist to update their wallet and history
    const updatedTourist = await Tourist.findByIdAndUpdate(
      touristId,
      {
        $inc: { wallet: bookingAmount }, // Increment the wallet balance by the booking amount (refund)
        $push: {
          // Add the refund as a transaction to the history
          history: {
            transactionType: "deposit",
            amount: bookingAmount,
            details: `Refunded for Cancelling Itinerary ${booking.itinerary.title}`,
          },
        },
      },
      { new: true, runValidators: true } // Ensure it returns the updated tourist and runs validators
    );

    if (!updatedTourist) {
      return res.status(400).json({ message: "Tourist not found" });
    }

    // Step 4: Respond with a success message
    res.status(200).json({
      message: "Booking deleted successfully and amount refunded",
      wallet: updatedTourist.wallet,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      message: "Failed to delete booking",
      error: error.message,
    });
  }
};

exports.getTouristBookings = async (req, res) => {
  try {
    const touristId = res.locals.user_id; // Get the user's ID from response locals
    const bookings = await ItineraryBooking.getBookingsForTourist(touristId);

    // Filter bookings to include only upcoming ones
    const upcomingBookings = bookings.filter(
      (booking) => new Date(booking.date) > new Date()
    );

    if (!upcomingBookings || upcomingBookings.length === 0) {
      return res.status(200).json([]); // Return empty array if no upcoming bookings
    }

    res.status(200).json(upcomingBookings); // Respond with upcoming bookings
  } catch (error) {
    res.status(500).json({ message: error.message }); // Handle errors
  }
};

exports.getTouristAttendedItineraries = async (req, res) => {
  try {
    const touristId = res.locals.user_id; // Get the user's ID from response locals
    const itineraries = await ItineraryBooking.getBookingsForTourist(touristId); // Fetch all bookings

    // Filter itineraries to include only those with past dates
    const attendedItineraries = itineraries.filter(
      (itinerary) => new Date(itinerary.date) < new Date()
    );

    if (!attendedItineraries || attendedItineraries.length === 0) {
      return res.status(200).json([]); // Return empty array if no attended itineraries
    }

    res.status(200).json(attendedItineraries); // Respond with attended itineraries
  } catch (error) {
    res.status(500).json({ message: error.message }); // Handle errors
  }
};

// exports.getItinerariesReport = async (req, res) => {
//   try {
//     const { startDate, endDate, month, year } = req.query;
//     let selectedItineraries = req.query.selectedItineraries;
//     const tourGuideId = res.locals.user_id; // Get the user's ID from response locals
//     const itineraries = await Itinerary.find({ tourGuide: tourGuideId }); // Fetch all itineraries
//     let itineraryIds = itineraries.map((itinerary) => itinerary._id); // Extract itinerary IDs
//     if (selectedItineraries) {
//       selectedItineraries = selectedItineraries.split(",");
//       itineraryIds = itineraryIds.filter((itineraryId) =>
//         selectedItineraries.includes(itineraryId.toString())
//       );
//     }

//     let bookings;
//     if (startDate && endDate) {
//       bookings = await ItineraryBooking.find({
//         itinerary: { $in: itineraryIds },
//         createdAt: { $gte: startDate, $lt: endDate },
//       }).populate("itinerary");
//     } else if (month && year) {
//       console.log(month, year);
//       const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
//       const endDate = new Date(parseInt(year), parseInt(month), 0);
//       // increment the end date by 1 to include the last day of the month
//       endDate.setDate(endDate.getDate() + 1);
//       // console.log(startDate, endDate);
//       bookings = await ItineraryBooking.find({
//         itinerary: { $in: itineraryIds },
//         date: { $gt: startDate, $lt: endDate },
//       }).populate("itinerary");
//     } else if (year) {
//       const startDate = new Date(parseInt(year), 0, 1);
//       const endDate = new Date(parseInt(year) + 1, 0, 1);
//       console.log(startDate, endDate);
//       bookings = await ItineraryBooking.find({
//         itinerary: { $in: itineraryIds },
//         createdAt: { $gt: startDate, $lte: endDate },
//       }).populate("itinerary");
//     } else {
//       bookings = await ItineraryBooking.find({
//         itinerary: { $in: itineraryIds },
//       }).populate("itinerary");
//     }

//     let totalRevenue = 0;
//     let totalTickets = 0;

//     // Calculate total number of tickets for each itinerary
//     let itineraryReport = itineraries.map((itinerary) => {
//       const tickets = bookings.reduce((total, booking) => {
//         return booking.itinerary._id.equals(itinerary._id)
//           ? total + booking.numberOfTickets
//           : total;
//       }, 0);

//       //Get the revenue for the itinerary
//       const revenue = bookings.reduce((total, booking) => {
//         return booking.itinerary._id.equals(itinerary._id)
//           ? total + booking.paymentAmount
//           : total;
//       }, 0);

//       totalRevenue += revenue;
//       totalTickets += tickets;

//       return { itinerary, tickets, revenue: revenue * 0.9 }; // Return itinerary report
//     });

//     itineraryReport = itineraryReport.filter((report) => report.tickets > 0); // Filter out itineraries with no tickets

//     totalRevenue *= 0.9;
//     res.status(200).json({ itineraryReport, totalRevenue, totalTickets });
//   } catch (error) {
//     res.status(500).json({ message: error.message }); // Handle errors
//   }
// };

exports.getItinerariesReport = async (req, res) => {
  try {
    const { day, month, year } = req.query;
    let selectedItineraries = req.query.selectedItineraries;
    const tourGuideId = res.locals.user_id; // Get the user's ID from response locals
    const itineraries = await Itinerary.find({ tourGuide: tourGuideId }); // Fetch all itineraries
    let itineraryIds = itineraries.map((itinerary) => itinerary._id); // Extract itinerary IDs
    if (selectedItineraries) {
      selectedItineraries = selectedItineraries.split(",");
      itineraryIds = itineraryIds.filter((itineraryId) =>
        selectedItineraries.includes(itineraryId.toString())
      );
    }

    const query = {};
    query.itinerary = { $in: itineraryIds };

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

    const bookings = await ItineraryBooking.find(query).populate("itinerary");

    let totalRevenue = 0;
    let totalTickets = 0;

    // Calculate total number of tickets for each itinerary
    let itineraryReport = itineraries.map((itinerary) => {
      const tickets = bookings.reduce((total, booking) => {
        return booking.itinerary._id.equals(itinerary._id)
          ? total + booking.numberOfTickets
          : total;
      }, 0);

      //Get the revenue for the itinerary
      const revenue = bookings.reduce((total, booking) => {
        return booking.itinerary._id.equals(itinerary._id)
          ? total + booking.paymentAmount
          : total;
      }, 0);

      totalRevenue += revenue;
      totalTickets += tickets;

      return { itinerary, tickets, revenue: revenue * 0.9 }; // Return itinerary report
    });

    // itineraryReport = itineraryReport.filter((report) => report.tickets > 0); // Filter out itineraries with no tickets
    itineraryReport = itineraryReport.sort((a, b) => b.revenue - a.revenue);
    totalRevenue *= 0.9;
    res.status(200).json({ itineraryReport, totalRevenue, totalTickets });
  } catch (error) {
    res.status(500).json({ message: error.message }); // Handle errors
  }
};

exports.getMyCurrentItineraries = async (req, res) => {
  try {
    const itineraries = await ItineraryBooking.find({
      user: res.locals.user_id,
    }).populate("itinerary");

    console.log(itineraries[0].itinerary);
    const now = new Date();
    const currentItineraries = itineraries.filter((itinerary) => {
      //get the end time by looping over the activities and adding the duration to the start time checing the latest time
      let endTime = new Date(itinerary.date);
      itinerary.itinerary.activities.forEach((activity) => {
        const activityEndTime = new Date(
          activity.timing + activity.duration * 60 * 60 * 1000
        );

        if (activityEndTime > endTime) {
          endTime = activityEndTime;
        }
      });

      const startTime = new Date(itinerary.date);
      console.log(startTime, endTime);
      return startTime < now && now < endTime;
    });

    res.status(200).json(currentItineraries);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
};
