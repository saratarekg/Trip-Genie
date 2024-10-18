const ItineraryBooking = require('../models/itineraryBooking');
const Itinerary = require('../models/itinerary');
const Tourist = require('../models/tourist');

// Create a new itinerary booking
exports.createBooking = async (req, res) => {
    try {
        const userId = res.locals.user_id;
        const { itinerary, paymentType, paymentAmount, numberOfTickets } = req.body;

        // Check if the itinerary exists
        const itineraryExists = await Itinerary.findById(itinerary);
        const user = await Tourist.findById(userId); // Get the user details, including wallet balance

        if (!itineraryExists) {
            return res.status(400).json({ message: 'Itinerary not found' });
        }

        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        let walletBalance = 0;
        // Check if payment type is "Wallet"
        if (paymentType === 'Wallet') {
            if (user.wallet < paymentAmount) {
                return res.status(400).json({ message: 'Insufficient funds in wallet' });
            }

            // Deduct the payment amount from the user's wallet
            walletBalance = user.wallet - paymentAmount;
             // Save the updated wallet balance
        }

        itinerary.isBooked = true;

        // Create the booking
        const newBooking = new ItineraryBooking({
            itinerary,
            paymentType,
            paymentAmount,
            user: userId,
            numberOfTickets
        });

         // Calculate loyalty points based on the user's badge level
         const loyaltyPoints = calculateLoyaltyPoints(paymentAmount, user.loyaltyBadge); 

         // Update total points and loyalty points using findByIdAndUpdate
         const totalPoints = user.totalPoints + loyaltyPoints; // Calculate total points
         
         // Update the tourist's record in the database
         const updatedTourist = await Tourist.findByIdAndUpdate(
             userId,
             {
                 $inc: {
                     totalPoints: loyaltyPoints,   // Increment total points
                     loyaltyPoints: loyaltyPoints   // Increment current loyalty points
                 },
                 loyaltyBadge: determineBadgeLevel(totalPoints) ,
                 wallet: walletBalance
             },
             { new: true, runValidators: true }
         );
 
         if (!updatedTourist) {
             return res.status(400).json({ message: "Tourist not found" });
         }

        await newBooking.save();
        res.status(201).json({ message: 'Booking created successfully', booking: newBooking });

       

       
     
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: 'Failed to create booking', error: error.message });
    }
};

const calculateLoyaltyPoints = (paymentAmount, badgeLevel) => {
    let pointsMultiplier = 0;

    // Determine points multiplier based on badge level
    switch (badgeLevel) {
        case 'Bronze':
            pointsMultiplier = 0.5; // 50% of amount paid
            break;
        case 'Silver':
            pointsMultiplier = 1.0; // 100% of amount paid
            break;
        case 'Gold':
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
        return 'Bronze';
    } else if (totalPoints <= 500000) {
        return 'Silver';
    } else {
        return 'Gold';
    }
};

// Get all bookings
exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await ItineraryBooking.find().populate('itinerary').populate('user');
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve bookings', error: error.message });
    }
};

// Get a booking by ID
exports.getBookingById = async (req, res) => {
    try {
        const booking = await ItineraryBooking.findById(req.params.id).populate('itinerary').populate('user');
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        res.status(200).json(booking);
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve booking', error: error.message });
    }
};

// Update a booking by ID
exports.updateBooking = async (req, res) => {
    try {
        const updatedBooking = await ItineraryBooking.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedBooking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        res.status(200).json({ message: 'Booking updated successfully', booking: updatedBooking });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update booking', error: error.message });
    }
};

// Delete a booking by ID
exports.deleteBooking = async (req, res) => {
    try {
        const deletedBooking = await ItineraryBooking.findByIdAndDelete(req.params.id);
        if (!deletedBooking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        res.status(200).json({ message: 'Booking deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete booking', error: error.message });
    }
};

exports.getTouristBookings = async (req, res) => {
    try {
        const touristId = res.locals.user_id; // Get the user's ID from response locals
        const bookings = await ItineraryBooking.getBookingsForTourist(touristId);

        if (!bookings || bookings.length === 0) {
            return res.status(200).json([]);
        }

        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
