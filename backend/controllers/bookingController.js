const Booking = require('../models/booking'); 
const Tourist = require("../models/tourist");


// Method to get the logged-in user's bookings
const getUserBookings = async (req, res) => {
    try {
        const userId = res.locals.user_id;

        // Find all bookings related to the logged-in user
        const bookings = await Booking.find({ user: userId });

        if (!bookings || bookings.length === 0) {
            return res.status(404).json({ message: 'No bookings found for this user' });
        }

        res.status(200).json({ bookings });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Method to delete a booking by ID
const deleteBooking = async (req, res) => {
    try {
        // Find and delete the booking
        const booking = await Booking.findByIdAndDelete(req.params.id);
        console.log(req.params.id);
        
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        res.status(200).json({ message: 'Booking deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Method to create a new booking
// const createBooking = async (req, res) => {
//     try {
//         const userId = res.locals.user_id; 
//         const { bookingType, activity, itinerary, historicalPlace, paymentType , paymentAmount} = req.body;

//         // Create a new booking
//         const newBooking = new Booking({
//             bookingType,
//             activity,
//             itinerary,
//             historicalPlace,
//             paymentType,
//             paymentAmount,
//             user: userId // Link the booking to the logged-in user
//         });

//         // Save the booking
//         await newBooking.save();

//         res.status(201).json({ message: 'Booking created successfully', booking: newBooking });
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// }

const createBooking = async (req, res) => {
    try {
        const touristId = res.locals.user_id;
        const { bookingType, activity, itinerary, historicalPlace, paymentType, paymentAmount } = req.body;

        // Create a new booking
        const newBooking = new Booking({
            bookingType,
            activity,
            itinerary,
            historicalPlace,
            paymentType,
            paymentAmount,
            user: touristId // Link the booking to the logged-in user
        });

        // Save the booking
        await newBooking.save();

        // Update user's loyalty points and badge
        const touristUpdate = await Tourist.findById(touristId);
        if (!touristUpdate) {
            return res.status(404).json({ error: 'Tourist not found' });
        }

        // Calculate points based on current level
        let pointsEarned = 0;
        if (touristUpdate.loyaltyPoints <= 100000) {
            pointsEarned = paymentAmount * 0.5;
        } else if (touristUpdate.loyaltyPoints <= 500000) {
            pointsEarned = paymentAmount * 1;
        } else {
            pointsEarned = paymentAmount * 1.5;
        }

        // Update user's total points and determine badge
        const newLoyaltyPoints = touristUpdate.loyaltyPoints + pointsEarned;

        let badge = "";
        if (newLoyaltyPoints <= 100000) {
            badge = 'Bronze';
        } else if (newLoyaltyPoints <= 500000) {
            badge = 'Silver';
        } else {
            badge = 'Gold';
        }

        // Save updated user information
        const updatedTourist = await Tourist.findByIdAndUpdate(
            res.locals.user_id,
            {
                loyaltyPoints: newLoyaltyPoints,
                loyaltyBadge: badge
            },
            { new: true } // Return the updated document
        ).exec();

        if (!updatedTourist) {
            return res.status(404).json({ message: "Tourist not found" });
        }

        // Add tourist to the attended array based on booking type
        if (bookingType === 'Activity' && activity) {
            await Activity.findByIdAndUpdate(
                activity,
                { $addToSet: { attended: touristId } } // Ensure no duplicates
            );
        } else if (bookingType === 'Itinerary' && itinerary) {
            await Itinerary.findByIdAndUpdate(
                itinerary,
                { $addToSet: { attended: touristId } } // Ensure no duplicates
            );
        }

        // Send the response
        res.status(201).json({
            message: 'Booking created successfully',
            booking: newBooking,
            tourist: updatedTourist,
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


module.exports = {
    createBooking,
    deleteBooking,
    getUserBookings
};
