const ActivityBooking = require('../models/activityBooking'); // Assuming your model is in models/activityBooking.js
const Activity = require('../models/activity'); // Assuming your Activity model is in models/activity.js
const Tourist = require('../models/tourist'); // Assuming your Tourist model is in models/tourist.js

// Create a new booking
exports.createBooking = async (req, res) => {
    try {
        const userId = res.locals.user_id;
        const { paymentType, paymentAmount, activity, numberOfTickets } = req.body;

        // Check if the activity and user exist
        const activityExists = await Activity.findById(activity);
        const user = await Tourist.findById(userId); // Get the user details, including wallet balance

        if (!activityExists) {
            return res.status(400).json({ message: 'Activity not found' });
        }

        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        // Check if payment type is "Wallet"
        if (paymentType === 'Wallet') {
            if (user.wallet < paymentAmount) {
                return res.status(400).json({ message: 'Insufficient funds in wallet' });
            }

            // Deduct the payment amount from the user's wallet
            user.wallet -= paymentAmount;
            await user.save(); // Save the updated wallet balance
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

        res.status(201).json(newBooking);
    } catch (error) {
        res.status(500).json({ message: error.message, error });
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
