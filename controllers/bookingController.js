const Booking = require('../models/booking'); 

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
const createBooking = async (req, res) => {
    try {
        const userId = res.locals.user_id; 
        const { bookingType, activity, itinerary, historicalPlace, paymentType } = req.body;

        // Create a new booking
        const newBooking = new Booking({
            bookingType,
            activity,
            itinerary,
            historicalPlace,
            paymentType,
            user: userId // Link the booking to the logged-in user
        });

        // Save the booking
        await newBooking.save();

        res.status(201).json({ message: 'Booking created successfully', booking: newBooking });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = {
    createBooking,
    deleteBooking,
    getUserBookings
};
