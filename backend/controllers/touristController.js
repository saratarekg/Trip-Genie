const Tourist = require("../models/tourist");
const TourGuide = require("../models/tourGuide");
const Advertiser = require("../models/advertiser");
const Seller = require("../models/seller");
const Admin = require("../models/admin");
const TourismGovernor = require("../models/tourismGovernor");
const Product = require("../models/product");
const Activity = require("../models/activity");
const Itinerary = require("../models/itinerary");
const ActivityBooking = require("../models/activityBooking");
const Purchase = require("../models/purchase");
const ItineraryBooking = require("../models/itineraryBooking");
const Currency = require("../models/currency");
const Complaint = require("../models/complaints");
const cloudinary = require("../utils/cloudinary");
const TouristTransportation = require("../models/touristTransportation");
const Transportation = require("../models/transportation");
const TouristFlight = require("../models/touristFlight");
const TouristHotel = require("../models/touristHotel");
const PromoCode = require("../models/promoCode");

const getAllTourists = async (req, res) => {
  try {
    const tourist = await Tourist.find();
    res.status(200).json(tourist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTouristByID = async (req, res) => {
  try {
    const tourist = await Tourist.findById(req.params.id);
    if (!tourist) {
      return res.status(404).json({ message: "Tourist not found" });
    }
    res.status(200).json(tourist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTourist = async (req, res) => {
  try {
    const tourist = await Tourist.findById(res.locals.user_id);
    if (!tourist) {
      return res.status(404).json({ message: "Tourist not found" });
    }
    res.status(200).json(tourist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateTourist = async (req, res) => {
  try {
    const tourist1 = await Tourist.findById(res.locals.user_id).lean();
    let picture = tourist1.profilePicture;

    const { nationality, mobile, jobOrStudent, profilePicture } = req.body; // Data to update

    let { email, username } = req.body;
    console.log(
      "hereweeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
    );
    console.log(email);
    console.log(username);
    email = email.toLowerCase();
    username = username.toLowerCase();

    if (username !== tourist1.username && (await usernameExists(username))) {
      return res.status(400).json({ message: "Username already exists" });
    }
    if (email !== tourist1.email && (await emailExists(email))) {
      return res.status(400).json({ message: "Email already exists" });
    }

    if (profilePicture === null) {
      picture = null;
      if (tourist1.profilePicture !== null) {
        await cloudinary.uploader.destroy(tourist1.profilePicture.public_id);
      }
    } else if (profilePicture.public_id === undefined) {
      const result = await cloudinary.uploader.upload(profilePicture, {
        folder: "tourist-profile-pictures",
      });
      if (tourist1.profilePicture !== null) {
        await cloudinary.uploader.destroy(tourist1.profilePicture.public_id);
      }
      picture = {
        public_id: result.public_id,
        url: result.secure_url,
      };
    }

    const tourist = await Tourist.findByIdAndUpdate(
      res.locals.user_id,
      {
        username,
        email,
        nationality,
        mobile,
        jobOrStudent,
        profilePicture: picture,
      },
      { new: true, runValidators: true }
    );
    if (!tourist) {
      return res.status(404).json({ message: "Tourist not found" });
    }
    res.status(200).json(tourist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTouristProfile = async (req, res) => {
  try {
    const touristId = res.locals.user_id;

    // Find the tour guide by their ID
    const tourist = await Tourist.findById(touristId)
      .populate("nationality")
      .populate("currentPromoCode")
      .exec();

    if (!tourist) {
      return res.status(404).json({ message: "Tourist not found" });
    }

    // Respond with the tour guide's profile
    res.status(200).json(tourist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTouristPreferences = async (req, res) => {
  try {
    const tourist = await Tourist.findById(res.locals.user_id);

    if (!tourist) {
      return res.status(404).json({ message: "Tourist not found" });
    }

    // Return the preferences
    res.status(200).json(tourist.preference);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updatePreferences = async (req, res) => {
  try {
    const tourist1 = await Tourist.findById(res.locals.user_id);

    const {
      budget,
      price,
      categories,
      tourLanguages,
      tourType,
      historicalPlaceType,
    } = req.body; // Preferences to update

    // Update preferences
    const updatedTourist = await Tourist.findByIdAndUpdate(
      res.locals.user_id,
      {
        "preference.budget": budget ?? Infinity, // Use the existing value if not provided
        "preference.price": price ?? 0, // Use the existing value if not provided
        "preference.categories": categories ?? tourist1.preference.categories, // Use the existing value if not provided
        "preference.tourLanguages":
          tourLanguages ?? tourist1.preference.tourLanguages,
        "preference.tourType": tourType ?? tourist1.preference.tourType,
        "preference.historicalPlaceType":
          historicalPlaceType ?? tourist1.preference.historicalPlaceType,
      },
      { new: true, runValidators: true }
    );

    if (!updatedTourist) {
      return res.status(404).json({ message: "Tourist not found" });
    }

    res.status(200).json(updatedTourist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateTouristProfile = async (req, res) => {
  try {
    const tourist1 = await Tourist.findById(res.locals.user_id).lean();

    let picture = tourist1.profilePicture;

    const { nationality, mobile, jobOrStudent, profilePicture, fname, lname } =
      req.body;
    let { email, username } = req.body;
    console.log("hereweeeeeeeeeeeeeeeeee");
    console.log(email);
    console.log(username);
    email = email.toLowerCase();
    username = username.toLowerCase();

    if (username !== tourist1.username && (await usernameExists(username))) {
      return res.status(400).json({ message: "Username already exists" });
    }
    if (email !== tourist1.email && (await emailExists(email))) {
      return res.status(400).json({ message: "Email already exists" });
    }

    if (profilePicture === null) {
      picture = null;
      if (tourist1.profilePicture !== null) {
        await cloudinary.uploader.destroy(tourist1.profilePicture.public_id);
      }
    } else if (profilePicture.public_id === undefined) {
      const result = await cloudinary.uploader.upload(profilePicture, {
        folder: "tourist-profile-pictures",
      });
      if (tourist1.profilePicture !== null) {
        await cloudinary.uploader.destroy(tourist1.profilePicture.public_id);
      }
      picture = {
        public_id: result.public_id,
        url: result.secure_url,
      };
    }
    // Find the Tourist by their ID and update with new data
    const tourist = await Tourist.findByIdAndUpdate(
      res.locals.user_id,
      {
        email,
        nationality,
        mobile,
        jobOrStudent,
        profilePicture: picture,
        fname,
        lname,
        username,
      },
      { new: true }
    )
      .populate("nationality")
      .exec();

    if (!tourist) {
      return res.status(404).json({ message: "Tourist not found" });
    }

    // Respond with the updated profile
    res.status(200).json({ message: "Profile updated successfully", tourist });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const bookFlight = async (req, res) => {
  const {
    paymentType,
    flightID,
    from,
    to,
    departureDate,
    arrivalDate,
    price,
    numberOfTickets,
    type,
    returnDepartureDate,
    returnArrivalDate,
    seatType,
    flightType,
    flightTypeReturn,
  } = req.body;
  const touristID = res.locals.user_id;

  try {
    const bookingData = {
      paymentType,
      touristID,
      flightID,
      from,
      to,
      departureDate,
      arrivalDate,
      price,
      numberOfTickets,
      type,
      seatType,
      flightType,
    };

    if (returnDepartureDate)
      bookingData.returnDepartureDate = returnDepartureDate;
    if (returnArrivalDate) bookingData.returnArrivalDate = returnArrivalDate;
    if (flightTypeReturn) bookingData.flightTypeReturn = flightTypeReturn;

    const booking = new TouristFlight(bookingData);

    const paymentAmount = price * numberOfTickets;

    const user = await Tourist.findById(touristID);

    if (!user) {
      return res.status(404).json({ message: "Tourist not found" });
    }

    let walletBalance = 0;

    // Check if payment type is "Wallet"
    if (paymentType === "Wallet") {
      if (user.wallet < paymentAmount) {
        return res
          .status(400)
          .json({ message: "Insufficient funds in wallet" });
      }

      walletBalance = user.wallet - paymentAmount;
    }

    const updateFields = {};

    if (paymentType === "Wallet") {
      updateFields.wallet = walletBalance; // Update wallet balance
      updateFields.$push = {
        history: {
          transactionType: "payment",
          amount: paymentAmount,
          details: `You’ve successfully booked a flight from ${from} to ${to}`,
        },
      };
    }

    // Perform the update
    const updatedTourist = await Tourist.findByIdAndUpdate(
      touristID,
      updateFields,
      { new: true, runValidators: true } // Ensure it returns the updated tourist
    );

    if (!updatedTourist) {
      return res.status(404).json({ message: "Tourist not found" });
    }

    const savedBooking = await booking.save();

    res.status(201).json({
      message: "Flight booking successful",
      booking: savedBooking,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const cancelFlightBooking = async (req, res) => {
  const { id } = req.params; // ID of the flight booking to cancel
  const touristID = res.locals.user_id;

  try {
    // Find the flight booking by ID
    const booking = await TouristFlight.findById(id);

    if (!booking) {
      return res.status(400).json({ message: "Booking not found" });
    }

    // Ensure the booking belongs to the user
    if (booking.touristID.toString() !== touristID) {
      return res.status(403).json({ message: "Unauthorized action" });
    }

    const refundAmount = booking.price * booking.numberOfTickets; // Calculate total refund amount

    // Update the tourist's wallet with the refund
    const updatedTourist = await Tourist.findByIdAndUpdate(
      touristID,
      { $inc: { wallet: refundAmount } }, // Increment wallet by the refund amount
      { new: true, runValidators: true }
    );

    // Log the refund transaction in the tourist's history
    await Tourist.findByIdAndUpdate(
      touristID,
      {
        $push: {
          history: {
            transactionType: "deposit",
            amount: refundAmount,
            details: `Refunded for Cancelling Flight: ${booking.from} to ${booking.to}`,
          },
        },
      },
      { new: true, runValidators: true }
    );

    // Remove the flight booking from the database
    await TouristFlight.findByIdAndDelete(id);

    res.status(200).json({
      message: "Flight booking canceled successfully and refund issued",
      data: {
        refundedAmount: refundAmount,
        newWalletBalance: updatedTourist.wallet,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const getMyFlights = async (req, res) => {
  const touristID = res.locals.user_id;

  try {
    const flights = await TouristFlight.find({ touristID });

    res.status(200).json(flights);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const bookHotel = async (req, res) => {
  const userId = res.locals.user_id; // Get the user's ID from response locals
  const {
    hotelID,
    hotelName,
    checkinDate,
    checkoutDate,
    numberOfRooms,
    roomName,
    price,
    numberOfAdults,
    paymentType,
  } = req.body;
  const touristID = res.locals.user_id;

  const user = await Tourist.findById(touristID);

  if (!user) {
    return res.status(404).json({ message: "Tourist not found" });
  }

  let walletBalance = 0;
  // Check if payment type is "Wallet"
  if (paymentType === "Wallet") {
    if (user.wallet < price) {
      return res.status(400).json({
        message: `Insufficient funds in wallet: ${user.wallet}, but the price is: ${price}`,
      });
    }

    walletBalance = user.wallet - price;
  }

  try {
    const booking = new TouristHotel({
      touristID,
      hotelID,
      hotelName,
      checkinDate,
      checkoutDate,
      numberOfRooms,
      roomName,
      price,
      numberOfAdults,
      paymentType,
    });

    const savedBooking = await booking.save();

    const updateFields = {};

    // Conditionally add wallet balance and history only for wallet payments
    if (paymentType === "Wallet") {
      updateFields.wallet = walletBalance; // Update wallet balance
      updateFields.$push = {
        history: {
          transactionType: "payment",
          amount: price,
          details: `You’ve successfully booked Hotel Rooms in ${hotelName}`,
        },
      };
    }

    // Perform the update
    const updatedTourist = await Tourist.findByIdAndUpdate(
      userId,
      updateFields,
      { new: true, runValidators: true } // Ensure it returns the updated tourist
    );

    if (!updatedTourist) {
      return res.status(404).json({ message: "Tourist not found" });
    }
    res.status(201).json({
      message: "Hotel booking successful",
      booking: savedBooking,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const cancelHotelBooking = async (req, res) => {
  const { id } = req.params; // ID of the booking to be canceled
  const touristID = res.locals.user_id;

  try {
    // Find the booking by ID
    const booking = await TouristHotel.findById(id);

    if (!booking) {
      return res.status(400).json({ message: "Booking not found" });
    }

    // Ensure the booking belongs to the user
    if (booking.touristID.toString() !== touristID) {
      return res.status(403).json({ message: "Unauthorized action" });
    }

    const refundAmount = booking.price; // Refund amount is the price of the booking

    // Update the tourist's wallet with the refund
    const updatedTourist = await Tourist.findByIdAndUpdate(
      touristID,
      { $inc: { wallet: refundAmount } }, // Increment wallet by refundAmount
      { new: true, runValidators: true }
    );

    // Log the refund transaction in the tourist's history
    await Tourist.findByIdAndUpdate(
      touristID,
      {
        $push: {
          history: {
            transactionType: "deposit",
            amount: refundAmount,
            details: `Refunded for Canceling Hotel Booking: ${booking.hotelName}`,
          },
        },
      },
      { new: true, runValidators: true }
    );

    // Remove the booking from the database
    await TouristHotel.findByIdAndDelete(id);

    res.status(200).json({
      message: "Hotel booking canceled successfully and refund issued",
      data: {
        refundedAmount: refundAmount,
        newWalletBalance: updatedTourist.wallet,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const getMyHotels = async (req, res) => {
  const touristID = res.locals.user_id;

  try {
    // Populate the 'tourist' field (or the field name you have in the schema)
    const hotels = await TouristHotel.find({ touristID }).populate("touristID"); // Add this to populate the tourist details

    res.status(200).json(hotels);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const bookTransportation = async (req, res) => {
  const { transportationID, seatsToBook, paymentMethod, promoCode } = req.body;
  const touristID = res.locals.user_id;

  try {
    // Step 1: Find the transportation and check available seats
    const transportation = await Transportation.findById(transportationID);

    if (!transportation) {
      return res.status(404).json({ message: "Transportation not found" });
    }

    if (transportation.remainingSeats < seatsToBook) {
      return res.status(400).json({ message: "Not enough seats available" });
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

    // Step 2: Calculate total cost
    let totalCost = transportation.ticketCost * seatsToBook;

    // Step 3: Apply promo code if provided
    if (usedPromoCode) {
      const discount = (totalCost * usedPromoCode.percentOff) / 100;
      totalCost -= discount;
    }

    // Step 4: Handle wallet payment if applicable
    if (paymentMethod === "wallet") {
      const tourist = await Tourist.findById(touristID);

      if (!tourist) {
        return res.status(404).json({ message: "Tourist not found" });
      }

      if (tourist.wallet < totalCost) {
        return res.status(400).json({ message: "Not enough funds in wallet" });
      }

      // Deduct amount and update history
      await Tourist.findByIdAndUpdate(
        touristID,
        {
          $inc: { wallet: -totalCost },
          $push: {
            history: {
              transactionType: "payment",
              amount: totalCost,
              details: `You’ve successfully booked Transportation ${transportation.vehicleType}`,
            },
          },
        },
        { new: true }
      );
    }

    // Step 5: Decrease remaining seats in the transportation
    transportation.remainingSeats -= seatsToBook;
    await transportation.save();

    // Step 6: Create a new booking record in TouristTransportation
    const booking = new TouristTransportation({
      touristID,
      transportationID,
      seatsBooked: seatsToBook,
      totalCost,
      paymentMethod,
      promoCode: usedPromoCode ? usedPromoCode : null
    });

    const savedBooking = await booking.save();

    // Step 7: Send response
    res.status(201).json({
      message: "Transportation booking successful",
      booking: savedBooking,
      remainingSeats: transportation.remainingSeats,
      percentageOff: usedPromoCode ? usedPromoCode.percentOff : 0,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const getUpcomingBookings = async (req, res) => {
  const touristID = res.locals.user_id;

  try {
    // Find all upcoming bookings by comparing timeDeparture
    const upcomingBookings = await TouristTransportation.find({ touristID })
      .populate({
        path: "transportationID",
        match: { timeDeparture: { $gt: new Date() } }, // Only upcoming dates
        select:
          "from to vehicleType ticketCost timeDeparture remainingSeats estimatedDuration", // Select specific fields if needed
      })
      .exec();

    // Filter out bookings where the transportationID does not match due to date filtering
    const filteredBookings = upcomingBookings.filter(
      (booking) => booking.transportationID
    );

    res.status(200).json(filteredBookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving upcoming bookings" });
  }
};

// Method to get all previous bookings for a tourist
const getPreviousBookings = async (req, res) => {
  const touristID = res.locals.user_id;

  try {
    // Find all previous bookings by comparing timeDeparture
    const previousBookings = await TouristTransportation.find({ touristID })
      .populate({
        path: "transportationID",
        match: { timeDeparture: { $lt: new Date() } }, // Only past dates
        select:
          "from to vehicleType ticketCost timeDeparture remainingSeats estimatedDuration", // Select specific fields if needed
      })
      .exec();

    // Filter out bookings where the transportationID does not match due to date filtering
    const filteredBookings = previousBookings.filter(
      (booking) => booking.transportationID
    );

    res.status(200).json(filteredBookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving previous bookings" });
  }
};

const deleteBooking = async (req, res) => {
  const { id } = req.params; // Booking ID from URL
  const touristID = res.locals.user_id; // Tourist ID from authenticated user context

  try {
    console.log(
      `Attempting to delete booking with ID: ${id} for tourist: ${touristID}`
    );

    // Step 1: Find the booking with the associated transportation details
    const booking = await TouristTransportation.findById(id).populate(
      "transportationID"
    );

    if (!booking) {
      console.log("Booking not found");
      return res.status(400).json({ message: "Booking not found" });
    }

    // Ensure the booking belongs to the authenticated tourist
    if (booking.touristID.toString() !== touristID) {
      console.log("Unauthorized: Cannot delete others' bookings");
      return res
        .status(403)
        .json({ message: "Unauthorized: Cannot delete others' bookings" });
    }

    const transportation = booking.transportationID;

    if (!transportation) {
      console.log("Associated transportation not found");
      return res
        .status(404)
        .json({ message: "Associated transportation not found" });
    }

    // Step 2: Calculate the refund amount and update the tourist's wallet
    const refundAmount = transportation.ticketCost * booking.seatsBooked;

    const tourist = await Tourist.findById(touristID);
    if (!tourist) {
      console.log("Tourist not found");
      return res.status(404).json({ message: "Tourist not found" });
    }

    // Refund the amount to the tourist's wallet
    await Tourist.findByIdAndUpdate(
      touristID,
      { $inc: { wallet: refundAmount } }, // Increment wallet by refundAmount
      { new: true, runValidators: true }
    );

    // Optionally, log the transaction in the tourist's history
    await Tourist.findByIdAndUpdate(
      touristID,
      {
        $push: {
          history: {
            transactionType: "deposit",
            amount: refundAmount,
            details: `Refunded for Cancelling: ${transportation.vehicleType}`,
          },
        },
      },
      { new: true, runValidators: true }
    );

    // Step 3: Restore the seats to the transportation document
    transportation.remainingSeats += booking.seatsBooked;
    await transportation.save();

    // Step 4: Delete the booking
    const deleteResult = await TouristTransportation.findByIdAndDelete(id);
    if (!deleteResult) {
      console.log("Failed to delete booking");
      return res.status(500).json({ message: "Failed to delete booking" });
    }

    console.log(`Booking with ID: ${id} successfully deleted`);

    // Step 5: Respond with success
    res.status(200).json({
      message: "Booking successfully deleted and refund issued",
      refundAmount,
      remainingSeats: transportation.remainingSeats,
    });
  } catch (error) {
    console.error("Error deleting booking:", error);
    res
      .status(500)
      .json({ message: "Failed to delete booking", error: error.message });
  }
};

const emailExists = async (email) => {
  if (await Tourist.findOne({ email })) {
    return true;
  } else if (await TourGuide.findOne({ email })) {
    return true;
  } else if (await Advertiser.findOne({ email })) {
    return true;
  } else if (await Seller.findOne({ email })) {
    return true;
  } else {
    console.log("email does not exist");
    return false;
  }
};

const usernameExists = async (username) => {
  if (
    (await Tourist.findOne({ username })) ||
    (await TourGuide.findOne({ username })) ||
    (await Advertiser.findOne({ username })) ||
    (await Seller.findOne({ username })) ||
    (await Admin.findOne({ username })) ||
    (await TourismGovernor.findOne({ username }))
  ) {
    return true;
  } else {
    return false;
  }
};

const redeemPoints = async (req, res) => {
  try {
    // Fetch the tourist based on user ID (assuming tourist is the logged-in user)
    const tourist = await Tourist.findById(res.locals.user_id);

    if (!tourist) {
      return res.status(404).json({ error: "Tourist not found" });
    }

    // Check if the tourist has any loyalty points to redeem
    if (tourist.loyaltyPoints === 0) {
      return res
        .status(400)
        .json({ error: "No loyalty points available for redemption" });
    }

    // Redeem all loyalty points
    // const pointsToRedeem = tourist.loyaltyPoints;
    const pointsToRedeem = Math.floor(tourist.loyaltyPoints / 10000) * 10000;

    // Calculate the redeemable cash based on all loyalty points
    const redeemableCash = pointsToRedeem / 100; // in EGP
    const updatedWalletinUSD = redeemableCash / 49.24; // in USD

    // Update the wallet and set loyalty points to 0
    const updatedTourist = await Tourist.findByIdAndUpdate(
      res.locals.user_id,
      {
        $set: { loyaltyPoints: tourist.loyaltyPoints - pointsToRedeem },
        $inc: { wallet: updatedWalletinUSD },
      },
      { new: true } // Return the updated document
    );

    res.status(200).json({
      message: `Successfully redeemed ${pointsToRedeem} points for ${redeemableCash} EGP`,
      walletBalance: updatedTourist.wallet,
      remainingPoints: updatedTourist.loyaltyPoints,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const tourist = await Tourist.findById(res.locals.user_id);
    if (!tourist) {
      return res.status(404).json({ message: "Tourist not found" });
    }
    const { oldPassword, newPassword } = req.body;
    const isMatch = await tourist.comparePassword(
      oldPassword,
      tourist.password
    );
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect old password" });
    }

    if (oldPassword === newPassword) {
      return res
        .status(400)
        .json({ message: "Old password and new password cannot be the same" });
    }
    tourist.password = newPassword;
    await tourist.save();
    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    if (error.name === "ValidationError") {
      // Gather all validation error messages
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return res
        .status(400)
        .json({ message: "Validation error", errors: validationErrors });
    }
    res.status(400).json({ error: error.message });
  }
};

// get currency code from the userPrefferedCurrency variable in the tourist model
const getCurrencyCode = async (req, res) => {
  try {
    const tourist = await Tourist.findById(res.locals.user_id);
    if (!tourist) {
      return res.status(404).json({ message: "Tourist not found" });
    }
    // preffered currency is an Object ID in a currency table
    const currency = await Currency.findById(tourist.preferredCurrency);
    if (!currency) {
      return res.status(404).json({ message: "Currency not found" });
    }
    res.status(200).json(currency.code);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getCurrencyID = async (req, res) => {
  try {
    const tourist = await Tourist.findById(res.locals.user_id);
    if (!tourist) {
      return res.status(404).json({ message: "Tourist not found" });
    }
    // preffered currency is an Object ID in a currency table
    const currency = await Currency.findById(tourist.preferredCurrency);
    if (!currency) {
      return res.status(404).json({ message: "Currency not found" });
    }
    res.status(200).json(currency._id);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const setCurrencyCode = async (req, res) => {
  try {
    const { currencyId } = req.body; // Get currency ID from request body

    // Check if the currency exists
    const currency = await Currency.findById(currencyId);
    if (!currency) {
      return res.status(400).json({ message: "Currency not found" });
    }

    // Find the tourist by user ID and update their preferred currency
    const tourist = await Tourist.findByIdAndUpdate(
      res.locals.user_id,
      { preferredCurrency: currencyId },
      { new: true } // Return the updated tourist document
    );

    if (!tourist) {
      return res.status(400).json({ message: "Tourist not found" });
    }

    res.status(200).json({
      message: "Preferred currency updated successfully",
      currencyCode: currency.code,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Tourist Controller
// Method to get the tourist's wishlist
const getWishlist = async (req, res) => {
  try {
    const userId = res.locals.user_id; // Get the logged-in tourist's ID from response locals

    // Find the tourist by their user ID
    const tourist = await Tourist.findById(userId)
      .populate("wishlist.product") // Populate product information in wishlist
      .exec();

    // Check if the tourist exists
    if (!tourist) {
      return res.status(400).json({ message: "Tourist not found" });
    }

    // if the product "isDeleted" or "isArchived" is true, remove it from the wishlist
    tourist.wishlist = tourist.wishlist.filter(
      (item) => !item.product.isDeleted && !item.product.isArchived
    );

    // Return the wishlist data
    res.status(200).json(tourist.wishlist);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Method to get the tourist's cart
const getCart = async (req, res) => {
  try {
    const userId = res.locals.user_id; // Get the logged-in tourist's ID from response locals

    // Find the tourist by their user ID
    const tourist = await Tourist.findById(userId)
      .populate("cart.product")
      .populate("currentPromoCode")
      .exec();

    // Check if the tourist exists
    if (!tourist) {
      return res.status(400).json({ message: "Tourist not found" });
    }
    // remove the product from the cart if it "isDeleted" or "isArchived" is true
    tourist.cart = tourist.cart.filter(
      (item) => !item.product.isDeleted && !item.product.isArchived
    );
    // Return the cart data
    res.status(200).json(tourist.cart);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const removeItemFromCart = async (req, res) => {
  const productId = req.params.id; // Extract the productId from the request body
  const userId = res.locals.user_id; // Get the user ID from the logged-in user

  try {
    // Debug: Log incoming request data

    // Find the tourist and update the cart by removing the product
    const user = await Tourist.findByIdAndUpdate(
      userId,
      {
        $pull: { cart: { product: productId } }, // Pull (remove) the item with the given productId
      },
      { new: true } // Return the updated document
    );

    // Check if user was found
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Check if the product was successfully removed
    if (!user.cart || user.cart.length === 0) {
      return res
        .status(400)
        .json({ message: "Cart is empty or item not found" });
    }

    // Success: Send back the updated cart
    res.status(200).json({ message: "Product removed from cart" });
  } catch (error) {
    // Debug: Print the error to console
    console.error("Error removing product from cart:", error);

    // Send a response with the error details
    res.status(500).json({ message: error.message });
  }
};

const emptyCart = async (req, res) => {
  const userId = res.locals.user_id; // Get the user ID from the logged-in user

  try {
    // Find the tourist and empty the cart by setting it to an empty array
    const user = await Tourist.findByIdAndUpdate(
      userId,
      { $set: { cart: [] } }, // Set the cart to an empty array
      { new: true } // Return the updated document
    );

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Cart emptied" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateCartProductQuantity = async (req, res) => {
  const { productId, newQuantity } = req.body; // Extract productId and newQuantity from the request body
  const userId = res.locals.user_id; // Get the user ID from the logged-in user

  try {
    // Validate that the new quantity is greater than 0
    if (newQuantity <= 0) {
      return res
        .status(400)
        .json({ message: "Quantity must be greater than 0" });
    }

    // Find the tourist and update the quantity of the product in the cart
    const user = await Tourist.findByIdAndUpdate(
      userId,
      {
        $set: { "cart.$[elem].quantity": newQuantity }, // Update the quantity field of the matching product
      },
      {
        arrayFilters: [{ "elem.product": productId }], // Find the item that matches the productId
        new: true, // Return the updated document
      }
    );

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const cartItem = user.cart.find((item) => {
      return item.product._id.toString() === productId.toString();
    });

    if (!cartItem) {
      return res.status(400).json({ message: "Product not found in cart" });
    }

    res
      .status(200)
      .json({ message: "Cart product quantity updated", cart: user.cart });
  } catch (error) {
    // Log the full error object for debugging purposes
    console.error("Error details:", error);

    // Send back only the message for the client
    res.status(500).json({ message: error.message, stack: error.stack });
  }
};

const removeProductFromWishlist = async (req, res) => {
  const productId = req.params.id; // Extract productId from the request params
  const userId = res.locals.user_id; // Get the logged-in user id

  try {
    // First, find the user and log their current wishlist
    const user = await Tourist.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Now, proceed to remove the product from the wishlist
    const updatedUser = await Tourist.findByIdAndUpdate(
      userId,
      {
        $pull: { wishlist: { product: productId } }, // Remove the product from the wishlist using $pull
      },
      { new: true } // Return the updated document
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "Failed to update user" });
    }

    res.status(200).json({
      message: "Product removed from wishlist",
      wishlist: updatedUser.wishlist, // Send back the updated wishlist
    });
  } catch (error) {
    console.error("Error removing product from wishlist:", error); // Log the full error
    res.status(500).json({ message: error.message });
  }
};

// Method to move a product from wishlist to cart
const moveProductToCart = async (req, res) => {
  const { id: productId } = req.params;
  const userId = res.locals.user_id; // Get logged-in user id

  try {
    // Find the product details using the productId
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(400).json({ message: "Product not found" });
    }

    // Find the user (tourist)
    const user = await Tourist.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Check if the product is already in the cart
    const existingCartItem = user.cart.find(
      (item) => item.product._id.toString() === productId
    );

    if (existingCartItem) {
      // If the product is already in the cart, update its quantity and totalPrice
      await Tourist.updateOne(
        { _id: userId, "cart.product": productId },
        {
          $set: {
            "cart.$.quantity": existingCartItem.quantity + 1, // Increase the quantity by 1
            "cart.$.totalPrice":
              (existingCartItem.quantity + 1) * product.price, // Update the total price
          },
        }
      );
    } else {
      // If the product is not in the cart, add it with quantity 1 and set the totalPrice
      await Tourist.findByIdAndUpdate(
        userId,
        {
          $push: {
            cart: {
              product: productId,
              quantity: 1,
              totalPrice: product.price,
            },
          },
        },
        { new: true }
      );
    }

    // Now remove the product from the wishlist
    await Tourist.findByIdAndUpdate(
      userId,
      {
        $pull: { wishlist: { product: productId } }, // Remove the product from wishlist
      },
      { new: true }
    );

    res.status(200).json({
      message: "Product moved to cart",
      cart: user.cart,
      wishlist: user.wishlist,
    });
  } catch (error) {
    console.error("Error occurred: ", error); // Logs the complete error object, including the stack trace
    res.status(500).json({
      message: "An error occurred",
      error: error.message, // Send only the error message in the response
      stack: process.env.NODE_ENV === "development" ? error.stack : null, // Send the stack trace in development mode only
    });
  }
};

// Method to add all products from wishlist to cart
const addAllToCart = async (req, res) => {
  const userId = res.locals.user_id; // Get logged-in user id

  try {
    // Find the user (tourist)
    const user = await Tourist.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Iterate through each product in the user's wishlist
    for (let item of user.wishlist) {
      const productId = item.product;
      const product = await Product.findById(productId);
      if (!product) {
        console.error(
          `Product with ID ${productId} not found in the database.`
        );
        continue; // Skip this product if it's not found
      }

      // Check if the product is already in the cart
      const existingCartItem = user.cart.find(
        (cartItem) => cartItem.product._id.toString() === productId.toString()
      );

      if (existingCartItem) {
        // If the product is already in the cart, update its quantity and totalPrice
        await Tourist.updateOne(
          { _id: userId, "cart.product": productId },
          {
            $set: {
              "cart.$.quantity": existingCartItem.quantity + 1, // Increase the quantity by 1
              "cart.$.totalPrice":
                (existingCartItem.quantity + 1) * product.price, // Update the total price
            },
          }
        );
      } else {
        // If the product is not in the cart, add it with quantity 1 and set the totalPrice
        await Tourist.findByIdAndUpdate(
          userId,
          {
            $push: {
              cart: {
                product: productId,
                quantity: 1,
                totalPrice: product.price,
              },
            },
          },
          { new: true }
        );
      }
    }

    // After moving all items, remove them from the wishlist
    await Tourist.findByIdAndUpdate(
      userId,
      {
        $set: { wishlist: [] }, // Clear the wishlist
      },
      { new: true }
    );

    res.status(200).json({
      message: "All products moved to cart",
      cart: user.cart,
      wishlist: [], // Wishlist should now be empty
    });
  } catch (error) {
    console.error("Error occurred while adding all products to cart:", error);
    res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
};

// Method to remove all products from the wishlist
const removeAllFromWishlist = async (req, res) => {
  const userId = res.locals.user_id; // Get logged-in user id

  try {
    // Find the user (tourist)
    const user = await Tourist.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Remove all products from the wishlist
    await Tourist.findByIdAndUpdate(
      userId,
      {
        $set: { wishlist: [] }, // Set the wishlist to an empty array
      },
      { new: true }
    );

    res.status(200).json({
      message: "All products removed from wishlist",
      wishlist: [], // Wishlist is now empty
    });
  } catch (error) {
    console.error(
      "Error occurred while removing all products from wishlist:",
      error
    );
    res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const tourist = await Tourist.findById(res.locals.user_id).lean();
    if (!tourist) {
      return res.status(404).json({ message: "Tourist not found" });
    }

    const today = new Date(); // Get today's date
    const tomorrow = new Date(today); // Clone today's date
    tomorrow.setDate(today.getDate() + 1);

    const bookedActivities = await ActivityBooking.find({
      user: res.locals.user_id,
    }).populate("activity");

    for (const booking of bookedActivities) {
      if (booking.activity.timing > Date.now()) {
        return res
          .status(400)
          .json({ message: "Cannot delete account with active bookings" });
      }
    }

    const bookedItineraries = await ItineraryBooking.find({
      user: res.locals.user_id,
      date: { $gte: tomorrow.toISOString() },
    });
    if (bookedItineraries.length > 0) {
      return res
        .status(400)
        .json({ message: "Cannot delete account with active bookings" });
    }

    const purchases = await Purchase.find({
      tourist: res.locals.user_id,
      status: "pending",
    });
    if (purchases.length > 0) {
      return res
        .status(400)
        .json({ message: "Cannot delete account with pending purchases" });
    }

    const transportations = await TouristTransportation.find({
      touristID: res.locals.user_id,
    }).populate("transportationID");

    for (const transportation of transportations) {
      if (transportation.transportationID.timeDeparture > Date.now()) {
        return res.status(400).json({
          message: "Cannot delete account with active transportation bookings",
        });
      }
    }

    await Complaint.deleteMany({ tourist: res.locals.user_id });

    if (tourist.profilePicture !== null) {
      await cloudinary.uploader.destroy(tourist.profilePicture.public_id);
    }

    await TourGuide.updateMany(
      { "comments.tourist": res.locals.user_id }, // Match documents where a comment has the matching tourist
      { $pull: { comments: { tourist: res.locals.user_id } } } // Pull the comment where the tourist matches
    );
    await Activity.updateMany(
      { "comments.tourist": res.locals.user_id }, // Match documents where a comment has the matching tourist
      { $pull: { comments: { tourist: res.locals.user_id } } } // Pull the comment where the tourist matches
    );
    await Itinerary.updateMany(
      { "comments.tourist": res.locals.user_id }, // Match documents where a comment has the matching tourist
      { $pull: { comments: { tourist: res.locals.user_id } } } // Pull the comment where the tourist matches
    );
    await Product.updateMany(
      { "reviews.tourist": res.locals.user_id }, // Match documents where a review has the matching tourist
      { $pull: { reviews: { tourist: res.locals.user_id } } } // Pull the review where the tourist matches
    );
    await Tourist.findByIdAndDelete(res.locals.user_id);
    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteTouristAccount = async (req, res) => {
  try {
    const tourist = await Tourist.findById(req.params.id).lean();
    if (!tourist) {
      return res.status(404).json({ message: "Tourist not found" });
    }

    const today = new Date(); // Get today's date
    const tomorrow = new Date(today); // Clone today's date
    tomorrow.setDate(today.getDate() + 1);

    const bookedActivities = await ActivityBooking.find({
      user: req.params.id,
    }).populate("activity");
    for (const booking of bookedActivities) {
      if (booking.activity.timing > Date.now()) {
        return res
          .status(400)
          .json({ message: "Cannot delete account with active bookings" });
      }
    }

    const bookedItineraries = await ItineraryBooking.find({
      user: req.params.id,
      date: { $gte: tomorrow.toISOString() },
    });
    if (bookedItineraries.length > 0) {
      return res
        .status(400)
        .json({ message: "Cannot delete account with active bookings" });
    }

    const purchases = await Purchase.find({
      tourist: req.params.id,
      status: "pending",
    });
    if (purchases.length > 0) {
      return res
        .status(400)
        .json({ message: "Cannot delete account with pending purchases" });
    }

    const transportations = await TouristTransportation.find({
      touristID: req.params.id,
    }).populate("transportationID");

    for (const transportation of transportations) {
      if (transportation.transportationID.timeDeparture > Date.now()) {
        return res.status(400).json({
          message: "Cannot delete account with active transportation bookings",
        });
      }
    }

    await Complaint.deleteMany({ tourist: req.params.id });

    if (tourist.profilePicture !== null) {
      await cloudinary.uploader.destroy(tourist.profilePicture.public_id);
    }

    await TourGuide.updateMany(
      { "comments.tourist": req.params.id }, // Match documents where a comment has the matching tourist
      { $pull: { comments: { tourist: req.params.id } } } // Pull the comment where the tourist matches
    );
    await Activity.updateMany(
      { "comments.tourist": req.params.id }, // Match documents where a comment has the matching tourist
      { $pull: { comments: { tourist: req.params.id } } } // Pull the comment where the tourist matches
    );
    await Itinerary.updateMany(
      { "comments.tourist": req.params.id }, // Match documents where a comment has the matching tourist
      { $pull: { comments: { tourist: req.params.id } } } // Pull the comment where the tourist matches
    );
    await Product.updateMany(
      { "reviews.tourist": req.params.id }, // Match documents where a review has the matching tourist
      { $pull: { reviews: { tourist: req.params.id } } } // Pull the review where the tourist
    );
    await Tourist.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addCard = async (req, res) => {
  try {
    const {
      cardType,
      cardNumber,
      expiryDate,
      holderName,
      cvv,
      default: isDefault,
    } = req.body;

    // Validate input
    if (!cardType || !cardNumber || !expiryDate || !holderName || !cvv) {
      return res.status(400).json({ message: "All card fields are required" });
    }

    if (!["Credit Card", "Debit Card"].includes(cardType)) {
      return res.status(400).json({ message: "Invalid card type" });
    }

    // Prepare the new card object
    const newCard = {
      cardType,
      cardNumber,
      expiryDate,
      holderName,
      cvv,
      default: isDefault || false,
    };

    // Step 1: Add the new card to the cards array
    const result = await Tourist.findOneAndUpdate(
      { _id: res.locals.user_id },
      { $push: { cards: newCard } },
      { new: true, runValidators: true }
    );

    if (!result) {
      return res.status(404).json({ message: "Tourist not found" });
    }

    // Step 2: If the new card is set as default, unset other defaults
    if (isDefault) {
      await Tourist.updateOne(
        { _id: res.locals.user_id },
        { $set: { "cards.$[elem].default": false } },
        {
          arrayFilters: [{ "elem.default": true }],
          runValidators: true,
        }
      );

      // Set the last added card as the default
      const lastIndex = result.cards.length - 1;
      await Tourist.updateOne(
        { _id: res.locals.user_id },
        { $set: { [`cards.${lastIndex}.default`]: true } }
      );
    }

    // Refetch the updated list of cards to return in the response
    const updatedTourist = await Tourist.findById(res.locals.user_id);

    return res.status(200).json({
      message: "Card added successfully",
      cards: updatedTourist.cards,
    });
  } catch (error) {
    console.error(error);
    if (error.name === "ValidationError") {
      return res
        .status(400)
        .json({ message: "Invalid card data", errors: error.errors });
    }
    return res
      .status(500)
      .json({ message: "An error occurred while adding the card" });
  }
};

const getAllCards = async (req, res) => {
  try {
    // Find the tourist by their ID
    const tourist = await Tourist.findById(res.locals.user_id).select("cards");

    // Check if tourist exists
    if (!tourist) {
      return res.status(404).json({ message: "Tourist not found" });
    }

    // Return the cards
    return res.status(200).json({ cards: tourist.cards });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "An error occurred while retrieving cards" });
  }
};

const changeDefaultCard = async (req, res) => {
  const { id } = req.params; // Assuming cardId is passed as a URL parameter

  try {
    // Find the tourist by their ID
    const tourist = await Tourist.findById(res.locals.user_id);

    // Check if tourist exists
    if (!tourist) {
      return res.status(404).json({ message: "Tourist not found" });
    }

    // Check if the card exists
    const card = tourist.cards.find((card) => card._id.toString() === id);
    if (!card) {
      return res.status(404).json({ message: "Card not found" });
    }

    // Update the default card
    const updateResult = await Tourist.updateOne(
      { _id: res.locals.user_id },
      {
        // Set the selected card as default and all others to not default
        $set: {
          "cards.$[selectedCard].default": true, // Set the selected card to default
          "cards.$[otherCards].default": false, // Set all other cards to not default
        },
      },
      {
        arrayFilters: [
          { "selectedCard._id": id }, // Filter for the selected card
          { "otherCards._id": { $ne: id } }, // Filter for all other cards
        ],
      }
    );
    if (updateResult.modifiedCount === 0) {
      return res
        .status(400)
        .json({ message: "Failed to update the default card" });
    }

    // Retrieve the updated tourist document to return the updated cards
    const updatedTourist = await Tourist.findById(res.locals.user_id).select(
      "cards"
    );

    return res.status(200).json({
      message: "Default card updated successfully",
      cards: updatedTourist.cards,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "An error occurred while updating the default card" });
  }
};

const deleteCard = async (req, res) => {
  try {
    const { id } = req.params; // Assuming the card ID is passed as a URL parameter

    // Validate the cardId parameter
    if (!id) {
      return res.status(400).json({ message: "Card ID is required." });
    }

    // Remove the card from the tourist's cards array
    const result = await Tourist.findOneAndUpdate(
      { _id: res.locals.user_id },
      { $pull: { cards: { _id: id } } },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({ message: "Tourist not found" });
    }

    // If the deleted card was the default card, set another card as default if available
    if (result.cards.length === 0) {
      // No cards left, do nothing
    } else if (result.cards.every((card) => !card.default)) {
      // If there are cards left but none are marked as default, set the first one as default
      await Tourist.updateOne(
        { _id: res.locals.user_id },
        { $set: { "cards.0.default": true } } // Set the first card as default
      );
    }

    return res
      .status(200)
      .json({ message: "Card deleted successfully", cards: result.cards });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "An error occurred while deleting the card" });
  }
};

const addShippingAddress = async (req, res) => {
  try {
    const {
      streetName,
      streetNumber,
      floorUnit,
      city,
      state,
      country,
      postalCode,
      landmark,
      locationType,
      default: isDefault,
    } = req.body;

    if (!streetName || !streetNumber || !city || !state || !country) {
      return res
        .status(400)
        .json({ message: "Required address fields are missing" });
    }

    // Prepare new address object
    const newAddress = {
      streetName,
      streetNumber,
      floorUnit,
      city,
      state,
      country,
      postalCode,
      landmark,
      locationType,
      default: isDefault || false,
    };

    // Fetch the current user's addresses
    const user = await Tourist.findById(res.locals.user_id);
    if (!user) {
      return res.status(404).json({ message: "Tourist not found" });
    }

    // If this is the first address, set it as default
    if (user.shippingAddresses.length === 0) {
      newAddress.default = true;
    }

    // Add the new address
    const result = await Tourist.findOneAndUpdate(
      { _id: res.locals.user_id },
      { $push: { shippingAddresses: newAddress } },
      { new: true, runValidators: true }
    );

    if (!result) {
      return res.status(404).json({ message: "Failed to add address." });
    }

    // If the new address is marked as default, unset others
    if (isDefault) {
      await Tourist.updateOne(
        { _id: res.locals.user_id },
        { $set: { "shippingAddresses.$[elem].default": false } },
        {
          arrayFilters: [{ "elem.default": true }],
          runValidators: true,
        }
      );

      // Set the last added address as the default
      const lastIndex = result.shippingAddresses.length - 1;
      await Tourist.updateOne(
        { _id: res.locals.user_id },
        { $set: { [`shippingAddresses.${lastIndex}.default`]: true } }
      );
    }

    // Return updated list of addresses
    const updatedTourist = await Tourist.findById(res.locals.user_id);
    return res.status(200).json({
      message: "Address added successfully",
      shippingAddresses: updatedTourist.shippingAddresses,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "An error occurred while adding the address" });
  }
};

const getAllShippingAddresses = async (req, res) => {
  try {
    const tourist = await Tourist.findById(res.locals.user_id).select(
      "shippingAddresses"
    );

    if (!tourist) {
      return res.status(404).json({ message: "Tourist not found" });
    }

    return res
      .status(200)
      .json({ shippingAddresses: tourist.shippingAddresses });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "An error occurred while retrieving addresses" });
  }
};
const changeDefaultShippingAddress = async (req, res) => {
  const { id } = req.params;

  try {
    const tourist = await Tourist.findById(res.locals.user_id);

    if (!tourist) {
      return res.status(404).json({ message: "Tourist not found" });
    }

    const address = tourist.shippingAddresses.find(
      (address) => address._id.toString() === id
    );
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    const updateResult = await Tourist.updateOne(
      { _id: res.locals.user_id },
      {
        $set: {
          "shippingAddresses.$[selectedAddress].default": true,
          "shippingAddresses.$[otherAddresses].default": false,
        },
      },
      {
        arrayFilters: [
          { "selectedAddress._id": id },
          { "otherAddresses._id": { $ne: id } },
        ],
      }
    );

    if (updateResult.modifiedCount === 0) {
      return res
        .status(400)
        .json({ message: "Failed to update the default address" });
    }

    const updatedTourist = await Tourist.findById(res.locals.user_id).select(
      "shippingAddresses"
    );
    return res.status(200).json({
      message: "Default address updated successfully",
      shippingAddresses: updatedTourist.shippingAddresses,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "An error occurred while updating the default address",
    });
  }
};

const deleteShippingAddress = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Address ID is required." });
    }

    const result = await Tourist.findOneAndUpdate(
      { _id: res.locals.user_id },
      { $pull: { shippingAddresses: { _id: id } } },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({ message: "Tourist not found" });
    }

    if (result.shippingAddresses.length === 0) {
      // No addresses left, do nothing
    } else if (result.shippingAddresses.every((address) => !address.default)) {
      // If no addresses are default, set the first one as default
      await Tourist.updateOne(
        { _id: res.locals.user_id },
        { $set: { "shippingAddresses.0.default": true } }
      );
    }

    return res.status(200).json({
      message: "Address deleted successfully",
      shippingAddresses: result.shippingAddresses,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "An error occurred while deleting the address" });
  }
};

const updateShippingAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const addressUpdates = req.body;

    if (!id) {
      return res.status(400).json({ message: "Address ID is required." });
    }

    // Validate the addressUpdates object
    if (!addressUpdates || Object.keys(addressUpdates).length === 0) {
      return res.status(400).json({ message: "Address updates are required." });
    }

    // Find the tourist by their ID
    const tourist = await Tourist.findById(res.locals.user_id);

    if (!tourist) {
      return res.status(404).json({ message: "Tourist not found" });
    }

    // Find the address to update
    const address = tourist.shippingAddresses.find(
      (address) => address._id.toString() === id
    );

    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    // If the updated address is set as default, loop through other addresses and set them to false
    if (addressUpdates.default) {
      // Update all other addresses to set `default` to false
      await Tourist.updateOne(
        { _id: res.locals.user_id },
        {
          $set: {
            "shippingAddresses.$[elem].default": false,
          },
        },
        {
          arrayFilters: [{ "elem._id": { $ne: id } }], // Exclude the address being updated
        }
      );
    }

    // Update the specific address with new details
    const result = await Tourist.updateOne(
      { _id: res.locals.user_id, "shippingAddresses._id": id },
      {
        $set: {
          "shippingAddresses.$.streetName": addressUpdates.streetName,
          "shippingAddresses.$.streetNumber": addressUpdates.streetNumber,
          "shippingAddresses.$.floorUnit": addressUpdates.floorUnit,
          "shippingAddresses.$.city": addressUpdates.city,
          "shippingAddresses.$.state": addressUpdates.state,
          "shippingAddresses.$.country": addressUpdates.country,
          "shippingAddresses.$.postalCode": addressUpdates.postalCode,
          "shippingAddresses.$.landmark": addressUpdates.landmark,
          "shippingAddresses.$.locationType": addressUpdates.locationType,
          "shippingAddresses.$.default": addressUpdates.default, // Ensure default status is updated as well
        },
      }
    );

    // Respond with success message and the updated addresses
    return res.status(200).json({
      message: "Address updated successfully",
      shippingAddresses: result.shippingAddresses,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "An error occurred while updating the address" });
  }
};

const applyPromoCode = async (req, res) => {
  const { promoCode } = req.body;

  try {
    if (!promoCode) {
      return res.status(400).json({ message: "Promo code is required." });
    }

    const promo = await PromoCode.usePromoCode(promoCode);

    return res.status(200).json({
      message: "Promo code applied successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      message:
        error.message || "An error occurred while applying the promo code",
    });
  }
};
// Get saved itineraries
const getSavedItineraries = async (req, res) => {
  try {
    const tourist = await Tourist.findById(res.locals.user_id).populate(
      "savedItinerary.itinerary"
    );

    if (!tourist) {
      return res.status(404).json({ message: "Tourist not found" });
    }

    // Filter out any null itineraries and map to return only the itinerary data
    const savedItineraries = tourist.savedItinerary
      .filter((item) => item.itinerary)
      .map((item) => item.itinerary);

    res.status(200).json(savedItineraries);
  } catch (error) {
    console.error("Error fetching saved itineraries:", error);
    res.status(500).json({
      message: "Error fetching saved itineraries",
      error: error.message,
    });
  }
};

// Add or remove an itinerary from saved itineraries
const saveItinerary = async (req, res) => {
  try {
    const { id } = req.params;
    const touristId = res.locals.user_id;

    // Find the tourist and check if the itinerary is already saved
    const tourist = await Tourist.findById(touristId);
    if (!tourist) {
      return res.status(404).json({ message: "Tourist not found" });
    }

    const itineraryIndex = tourist.savedItinerary.findIndex(
      (item) => item && item.itinerary && item.itinerary.toString() === id
    );

    if (itineraryIndex > -1) {
      // Itinerary is already saved, so remove it
      await Tourist.findByIdAndUpdate(
        touristId,
        { $pull: { savedItinerary: { itinerary: id } } },
        { new: true }
      );
      return res
        .status(200)
        .json({ message: "Itinerary removed from saved list", success: true });
    } else {
      // Itinerary is not saved, so add it
      await Tourist.findByIdAndUpdate(
        touristId,
        { $push: { savedItinerary: { itinerary: id } } },
        { new: true }
      );
      return res
        .status(200)
        .json({ message: "Itinerary saved successfully", success: true });
    }
  } catch (error) {
    console.error("Error saving/removing itinerary:", error);
    res.status(500).json({
      message: "Error saving/removing itinerary",
      error: error.message,
    });
  }
};

// Get saved activities
const getSavedActivities = async (req, res) => {
  try {
    const tourist = await Tourist.findById(res.locals.user_id).populate(
      "savedActivity.activity"
    );

    if (!tourist) {
      return res.status(404).json({ message: "Tourist not found" });
    }

    // Filter out any null activities and map to return only the activity data
    const savedActivities = tourist.savedActivity
      .filter((item) => item.activity)
      .map((item) => item.activity);

    res.status(200).json(savedActivities);
  } catch (error) {
    console.error("Error fetching saved activities:", error);
    res.status(500).json({
      message: "Error fetching saved activities",
      error: error.message,
    });
  }
};

// Add or remove an activity from saved activities
const saveActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const touristId = res.locals.user_id;

    // Find the tourist and check if the activity is already saved
    const tourist = await Tourist.findById(touristId);
    if (!tourist) {
      return res.status(404).json({ message: "Tourist not found" });
    }

    const activityIndex = tourist.savedActivity.findIndex(
      (item) => item && item.activity && item.activity.toString() === id
    );

    if (activityIndex > -1) {
      // Activity is already saved, so remove it
      await Tourist.findByIdAndUpdate(
        touristId,
        { $pull: { savedActivity: { activity: id } } },
        { new: true }
      );
      return res
        .status(200)
        .json({ message: "Activity removed from saved list", success: true });
    } else {
      // Activity is not saved, so add it
      await Tourist.findByIdAndUpdate(
        touristId,
        { $push: { savedActivity: { activity: id } } },
        { new: true }
      );
      return res
        .status(200)
        .json({ message: "Activity saved successfully", success: true });
    }
  } catch (error) {
    console.error("Error saving/removing activity:", error);
    res.status(500).json({
      message: "Error saving/removing activity",
      error: error.message,
    });
  }
};

// Controller function to retrieve a promo code using a POST request with the promo code in the body
const getPromoCode = async (req, res) => {
  const { code } = req.body;
  const touristId = res.locals.user_id; // Assuming the tourist's ID is in `req.user` from authentication middleware

  try {
    // Check if code is provided in the request body
    if (!code) {
      return res.status(400).json({ message: "Promo code is required." });
    }

    // Convert code to uppercase and log it to ensure it's in the correct format
    const promoCodeUpperCase = code.toUpperCase();

    // Retrieve promo code from the database (case-insensitive search)
    const promo = await PromoCode.findOne({ code: promoCodeUpperCase });

    // Log the result of the database query
    if (!promo) {
      return res.status(404).json({ message: "Promo code not found." });
    }

    const currentDate = new Date();
    const startDate = new Date(promo.dateRange.start);
    const endDate = new Date(promo.dateRange.end);

    if (
      promo.timesUsed <= promo.usage_limit &&
      (currentDate >= startDate || currentDate <= endDate) &&
      promo.status == "active"
    ) {
      const tourist = await Tourist.findByIdAndUpdate(
        touristId, // The ID of the tourist to find
        { $set: { currentPromoCode: promo._id } }, // The update operation (sets the new promo code)
        { new: true } // This option ensures that the returned document is the updated one
      );

      if (!tourist) {
        return res.status(404).json({ message: "Tourist not found." });
      }
    }

    // Save the promo code in the tourist's profile

    // Return promo code details along with a success message
    return res.status(200).json({
      promoCode: {
        code: promo.code,
        status: promo.status,
        percentOff: promo.percentOff,
        usage_limit: promo.usage_limit,
        timesUsed: promo.timesUsed,
        dateRange: promo.dateRange,
      },
    });
  } catch (error) {
    console.error("Error retrieving promo code:", error); // Log any error that occurs
    return res.status(500).json({
      message: "An error occurred while retrieving the promo code.",
    });
  }
};

const getTouristNotifications = async (req, res) => {
  try {
    const touristId = res.locals.user_id;

    if (!touristId) {
      return res.status(400).json({ message: "tourist ID is required" });
    }

    const tourist = await Tourist.findById(
      touristId,
      "notifications hasUnseenNotifications"
    );

    if (!tourist) {
      return res.status(404).json({ message: "tourist not found" });
    }

    const sortedNotifications = tourist.notifications.sort(
      (a, b) => b.date - a.date
    );

    return res.status(200).json({
      notifications: sortedNotifications,
      hasUnseenNotifications: tourist.hasUnseenNotifications,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const markDropdownAsOpened = async (req, res) => {
  try {
    const touristId = res.locals.user_id;

    const result = await Tourist.updateOne(
      { _id: touristId },
      { $set: { hasUnseenNotifications: false } }
    );

    if (result.modifiedCount === 0) {
      return res
        .status(404)
        .json({ message: "Tourist not found or already updated" });
    }

    res.json({ message: "Dropdown marked as opened" });
  } catch (error) {
    console.error("Error marking dropdown as opened:", error.message);
    res.status(500).json({ message: "Error marking dropdown as opened" });
  }
};

const markNotificationsAsSeen = async (req, res) => {
  try {
    // Find the seller by their ID and update the notifications in one operation
    const result = await Tourist.updateOne(
      { _id: res.locals.user_id }, // Find seller by user ID
      {
        $set: {
          "notifications.$[elem].seen": true, // Set 'seen' to true for all unseen notifications
        },
      },
      {
        arrayFilters: [{ "elem.seen": false }], // Only update notifications where seen is false
      }
    );

    // Update 'hasUnseenNotifications' to false after marking all notifications as seen
    await Tourist.updateOne(
      { _id: res.locals.user_id },
      {
        $set: {
          hasUnseenNotifications: false, // Set 'hasUnseenNotifications' to false
        },
      }
    );

    res.json({ message: "All notifications marked as seen" });
  } catch (error) {
    console.error("Error marking notifications as seen:", error.message);
    res.status(500).json({ message: "Error marking notifications as seen" });
  }
};

const markNotificationAsSeenForTourist = async (req, res) => {
  try {
    const notificationId = req.params.id; // Get the notification ID from the request parameters

    // Find the tourist by their ID and update the specific notification by its ID
    const result = await Tourist.updateOne(
      {
        _id: res.locals.user_id, // Find the tourist by their user ID
        "notifications._id": notificationId, // Match the specific notification by its ID
      },
      {
        $set: {
          "notifications.$.seen": true, // Set 'seen' to true for the specific notification
        },
      }
    );

    if (result.modifiedCount === 0) {
      console.log("Notification not found or already marked as seen");
    }

    // Check if there are any other unseen notifications left
    const tourist = await Tourist.findOne({ _id: res.locals.user_id });
    const hasUnseenNotifications = tourist.notifications.some(
      (notification) => notification.seen === false
    );

    if (!hasUnseenNotifications) {
      // If no unseen notifications exist, set 'hasUnseenNotifications' to false
      await Tourist.updateOne(
        { _id: res.locals.user_id },
        {
          $set: {
            hasUnseenNotifications: false, // Set 'hasUnseenNotifications' to false
          },
        }
      );
    }

    res.json({ message: "Notification marked as seen" });
  } catch (error) {
    console.error(
      "Error marking notification as seen for tourist:",
      error.message
    );
    res
      .status(500)
      .json({ message: "Error marking notification as seen for tourist" });
  }
};

const hasUnseenNotifications = async (req, res) => {
  try {
    const tourist = await Tourist.findById(
      res.locals.user_id,
      "hasUnseenNotifications"
    );

    if (!tourist) {
      return res.status(404).json({ message: "tourist not found" });
    }

    res.json({ hasUnseen: tourist.hasUnseenNotifications });
  } catch (error) {
    console.error("Error checking unseen notifications:", error.message);
    res.status(500).json({ message: "Error checking unseen notifications" });
  }
};

const getVisitedPages = async (req, res) => {
  try {
    const tourist = await Tourist.findById(res.locals.user_id).select(
      "visitedPages"
    );

    if (!tourist) {
      return res.status(400).json({ message: "Tourist not found" });
    }

    const visitedPages = tourist.visitedPages || [];

    return res.status(200).json({ visitedPages });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "An error occurred while retrieving visited pages" });
  }
};

const updateVisitedPages = async (req, res) => {
  try {
    const { visitedPages } = req.body;
    const tourist = await Tourist.findByIdAndUpdate(
      res.locals.user_id,
      {
        $addToSet: { visitedPages: visitedPages },
      },
      { new: true }
    );

    return res.status(200).json({ visitedPages: tourist.visitedPages });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "An error occurred while updating visited pages" });
  }
};

const getPromoCodes = async (req, res) => {
  try {
    const now = new Date();
    let promoCodes = await PromoCode.find({
      type: "general",
      status: "active",
      "dateRange.start": { $lte: now },
      "dateRange.end": { $gte: now },
    });
    promoCodes = promoCodes.filter(
      (promo) => promo.timesUsed < promo.usage_limit
    );
    return res.status(200).json({ promoCodes });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "An error occurred" });
  }
};

module.exports = {
  removeProductFromWishlist,
  moveProductToCart,
  getAllTourists,
  getTouristByID,
  getTourist,
  updateTourist,
  getTouristProfile,
  updateTouristProfile,
  redeemPoints,
  changePassword,
  updatePreferences,
  getTouristPreferences,
  getCart,
  getWishlist,
  removeItemFromCart,
  emptyCart,
  updateCartProductQuantity,
  getCurrencyCode,
  setCurrencyCode,
  getCurrencyID,
  deleteAccount,
  deleteTouristAccount,
  addCard,
  getAllCards,
  changeDefaultCard,
  deleteCard,
  addShippingAddress,
  getAllShippingAddresses,
  changeDefaultShippingAddress,
  deleteShippingAddress,
  updateShippingAddress,
  bookTransportation,
  getUpcomingBookings,
  getPreviousBookings,
  deleteBooking,
  bookFlight,
  cancelFlightBooking,
  bookHotel,
  cancelHotelBooking,
  getMyFlights,
  getMyHotels,
  addAllToCart,
  removeAllFromWishlist,
  applyPromoCode,
  getPromoCode,
  getSavedActivities,
  saveActivity,
  getSavedItineraries,
  saveItinerary,
  getTouristNotifications,
  markNotificationsAsSeen,
  hasUnseenNotifications,
  markNotificationAsSeenForTourist,
  markDropdownAsOpened,
  getVisitedPages,
  updateVisitedPages,
  getPromoCodes,
};
