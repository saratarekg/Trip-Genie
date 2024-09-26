const TourGuide = require('../models/tourGuide');

const Itinerary = require('../models/itinerary'); // Adjust the path as needed



const getTourGuideProfile = async (req, res) => {
    try {
        const tourGuideId = res.locals.user_id;

        // Find the tour guide by their ID
        const tourGuide = await TourGuide.findById(tourGuideId);

        if (!tourGuide) {
            return res.status(404).json({ message: 'Tour Guide not found' });
        }

        // Respond with the tour guide's profile
        res.status(200).json(tourGuide);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateTourGuide = async (req, res) => {
    try {
        const { email, username, nationality, mobile, yearsOfExperience, previousWorks} = req.body; // Data to update
        const { id } = req.params;

        // Find the TourGuide by ID and update it with the provided data
        const tourGuide = await TourGuide.findByIdAndUpdate(id, { email, username, nationality, mobile, yearsOfExperience, previousWorks}, { new: true, runValidators: true });

        if (!tourGuide) {
            return res.status(404).json({ message: 'Tour Guide not found' });
        }

        res.status(200).json({ message: 'Tour Guide updated successfully', tourGuide });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateTourGuideProfile = async (req, res) => {
    try {
        const tourGuideId = res.locals.user_id;  // Get the current user's ID
        const updatedData = req.body;  // The new profile data from the request body

        // Find the TourGuide by their ID and update with new data
        const tourGuide = await TourGuide.findByIdAndUpdate(tourGuideId, updatedData, { new: true, runValidators: true });

        if (!tourGuide) {
            return res.status(404).json({ message: 'Tour Guide not found' });
        }

        // Respond with the updated profile
        res.status(200).json({ message: 'Profile updated successfully', tourGuide });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};




module.exports = {  
    updateTourGuide,
    getTourGuideProfile,
    updateTourGuideProfile,
    deleteItinerary
};
