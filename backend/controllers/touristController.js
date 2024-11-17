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
        console.log("Profile picture deleted");
      }
    } else if (profilePicture.public_id === undefined) {
      const result = await cloudinary.uploader.upload(profilePicture, {
        folder: "tourist-profile-pictures",
      });
      if (tourist1.profilePicture !== null) {
        await cloudinary.uploader.destroy(tourist1.profilePicture.public_id);
        console.log("Profile picture xxxxx");
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
    console.log(tourist1);
    let picture = tourist1.profilePicture;
    console.log(picture);
    const { nationality, mobile, jobOrStudent, profilePicture } = req.body;
    let { email, username } = req.body;
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
    const booking = new TouristFlight({
      touristID,
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
    });

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
  const {
    hotelID,
    hotelName,
    checkinDate,
    checkoutDate,
    numberOfRooms,
    roomName,
    price,
    numberOfAdults,
  } = req.body;
  const touristID = res.locals.user_id;

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
    });

    const savedBooking = await booking.save();

    res.status(201).json({
      message: "Hotel booking successful",
      booking: savedBooking,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const getMyHotels = async (req, res) => {
  const touristID = res.locals.user_id;

  try {
    const hotels = await TouristHotel.find({ touristID });

    res.status(200).json(hotels);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const bookTransportation = async (req, res) => {
  const { transportationID, seatsToBook, paymentMethod } = req.body;
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

    // Step 2: Calculate total cost and handle wallet payment if applicable
    const totalCost = transportation.ticketCost * seatsToBook;

    if (paymentMethod === "wallet") {
      const tourist = await Tourist.findById(touristID);

      if (!tourist) {
        return res.status(404).json({ message: "Tourist not found" });
      }

      if (tourist.wallet < totalCost) {
        return res.status(400).json({ message: "Not enough funds in wallet" });
      }

      // Deduct the amount from the tourist's wallet
      await Tourist.findByIdAndUpdate(
        touristID,
        { $inc: { wallet: -totalCost } },
        { new: true }
      );
    }

    // Step 3: Decrease the remaining seats in the transportation
    transportation.remainingSeats -= seatsToBook;
    await transportation.save();

    // Step 4: Create a new booking record in TouristTransportation
    const booking = new TouristTransportation({
      touristID,
      transportationID,
      seatsBooked: seatsToBook,
      totalCost,
      paymentMethod,
    });

    const savedBooking = await booking.save();

    res.status(201).json({
      message: "Transportation booking successful",
      booking: savedBooking,
      remainingSeats: transportation.remainingSeats,
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
        select: "from to vehicleType ticketCost timeDeparture remainingSeats", // Select specific fields if needed
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
        select: "from to vehicleType ticketCost timeDeparture remainingSeats", // Select specific fields if needed
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
  const { id } = req.params; // assuming bookingID is passed as a URL parameter
  const touristID = res.locals.user_id;

  try {
    // Step 1: Find the booking to delete
    const booking = await TouristTransportation.findById(id).populate(
      "transportationID"
    );

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check if the booking belongs to the correct tourist
    if (booking.touristID.toString() !== touristID) {
      return res
        .status(403)
        .json({ message: "You can only delete your own bookings" });
    }

    const transportation = booking.transportationID;

    // Step 2: refund the cost to the tourist's wallet
    const totalCost = transportation.ticketCost * booking.seatsBooked;
    const tourist = await Tourist.findById(touristID);

    if (!tourist) {
      return res.status(404).json({ message: "Tourist not found" });
    }

    // Increment the wallet by the refund amount
    console.log(tourist);
    await Tourist.findByIdAndUpdate(
      touristID,
      { $inc: { wallet: totalCost } }, // Increase wallet by the refund amount
      { new: true, runValidators: true }
    );

    // Step 3: Delete the booking using findByIdAndDelete
    await TouristTransportation.findByIdAndDelete(id);

    // Step 4: Update the remaining seats in the transportation document
    // console.log(booking.seatsToBook);
    transportation.remainingSeats += booking.seatsBooked;
    await transportation.save();

    res.status(200).json({
      message: "Booking successfully deleted and refunded (if wallet used)",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting booking" });
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
    console.log("username exists");
    return true;
  } else {
    console.log("username does not exist");
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
    const pointsToRedeem = tourist.loyaltyPoints;

    // Calculate the redeemable cash based on all loyalty points
    const redeemableCash = pointsToRedeem / 100; // in EGP
    const updatedWalletinUSD = redeemableCash / 49.24; // in USD

    // Update the wallet and set loyalty points to 0
    const updatedTourist = await Tourist.findByIdAndUpdate(
      res.locals.user_id,
      {
        $set: { loyaltyPoints: 0 },
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
    console.log(currencyId);

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
      .populate("cart.product") // Populate product information in the cart
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
    console.log(
      "Removing item with productId:",
      productId,
      "for userId:",
      userId
    );

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
      console.log(1);

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
      console.log(2);
      return res.status(400).json({ message: "User not found" });
    }

    const cartItem = user.cart.find((item) => {
      console.log("Iterating over cart item:", item); // Log every iteration
      return item.product._id.toString() === productId.toString();
    });

    if (cartItem) {
      console.log("Found cart item:", cartItem);
    } else {
      console.log("No matching cart item found for productId:", productId);
    }
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
  console.log("Removing product with ID:", productId); // Debug log the productId being passed
  const userId = res.locals.user_id; // Get the logged-in user id

  try {
    // First, find the user and log their current wishlist
    const user = await Tourist.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Debug log the current wishlist
    console.log("Current wishlist:", user.wishlist);

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

    // Debug log the updated wishlist
    console.log("Updated wishlist:", updatedUser.wishlist);

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
    console.log("alo");
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

    console.log(streetName, streetNumber, city, state, country);
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

    // Step 1: Add the new address
    const result = await Tourist.findOneAndUpdate(
      { _id: res.locals.user_id },
      { $push: { shippingAddresses: newAddress } },
      { new: true, runValidators: true }
    );

    if (!result) {
      return res.status(404).json({ message: "Tourist not found" });
    }

    // Step 2: If the new address is set as default, unset other defaults
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

    // Update the address fields
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
        },
      }
    );

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
  bookHotel,
  getMyFlights,
  getMyHotels,
  addAllToCart,
  removeAllFromWishlist,
  applyPromoCode,
};
