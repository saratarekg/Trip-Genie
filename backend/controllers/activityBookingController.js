const ActivityBooking = require('../models/activityBooking'); // Assuming your model is in models/activityBooking.js
const Activity = require('../models/activity'); // Assuming your Activity model is in models/activity.js
const Tourist = require('../models/tourist'); // Assuming your Tourist model is in models/tourist.js

// Create a new booking
exports.createBooking = async (req, res) => {
    try {
        const userId = res.locals.user_id; // Get the user's ID from response locals
        const { paymentType, paymentAmount, activity, numberOfTickets } = req.body;

        // Check if the activity exists
        const activityExists = await Activity.findById(activity);
        const user = await Tourist.findById(userId); // Get the user details, including wallet balance

        if (!activityExists) {
            return res.status(400).json({ message: 'Activity not found' });
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

        // Create a new booking
        const newBooking = new ActivityBooking({
            activity,
            paymentType,
            paymentAmount,
            numberOfTickets,
            user: userId
        });

        await newBooking.save();

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
            return res.status(404).json({ message: "Tourist not found" });
        }

        // Respond with the updated booking and tourist profile
        res.status(201).json({
            message: "Booking created successfully",
            booking: newBooking,
            tourist: updatedTourist,
        });
    } catch (error) {
        res.status(500).json({ message: error.message, error });
    }
};

// Function to calculate loyalty points based on badge level
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
        const bookings = await ActivityBooking.find()
            .populate('activity')  // Populate activity details
            .populate('user');  // Populate user details

        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Get a specific booking by ID
exports.getBookingById = async (req, res) => {
    try {
        const booking = await ActivityBooking.findById(req.params.id)
            .populate('activity')
            .populate('user');

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        res.status(200).json(booking);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Update a booking
exports.updateBooking = async (req, res) => {
    try {
        const updatedBooking = await ActivityBooking.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        ).populate('activity').populate('user');

        if (!updatedBooking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        res.status(200).json(updatedBooking);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Delete a booking
exports.deleteBooking = async (req, res) => {
    try {
        const deletedBooking = await ActivityBooking.findByIdAndDelete(req.params.id);

        if (!deletedBooking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        res.status(200).json({ message: 'Booking deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

exports.getTouristBookings = async (req, res) => {
    try {
        const touristId = res.locals.user_id; // Get the user's ID from response locals
        const bookings = await ActivityBooking.getBookingsForTourist(touristId);

        if (!bookings || bookings.length === 0) {
            return res.status(400).json({ message: 'No bookings found for this tourist.' });
        }

        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};