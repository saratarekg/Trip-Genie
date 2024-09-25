const TourGuide = require('../models/tourGuide');

const Itinerary = require('../models/itinerary'); // Adjust the path as needed


const getTourGuideProfile = async (req, res) => {
    try {
        // Assuming the logged-in tour guide's ID is stored in req.user._id
        const tourGuideId = req.user._id;

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

// const getTourGuideByID = async (req, res) => {
//     try {
//         const tourGuide = await TourGuide.findById(req.params.id);
//         if (!tourGuide) {
//             return res.status(404).json({ message: 'Tour Guide not found' });
//         }
//         res.status(200).json(tourGuide);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

const updateTourGuide = async (req, res) => {
    try {
        const updatedData = req.body; // Data to update
        const { id } = req.params;

        // Find the TourGuide by ID and update it with the provided data
        const tourGuide = await TourGuide.findByIdAndUpdate(id, updatedData, { new: true, runValidators: true });

        if (!tourGuide) {
            return res.status(404).json({ message: 'Tour Guide not found' });
        }

        res.status(200).json({ message: 'Tour Guide updated successfully', tourGuide });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// Function to get all itineraries for a specific tour guide
const getItinerariesByTourGuide = async (req, res) => {
    try {
        const { tourGuideId } = req.params; // Assuming tourGuideId is passed in the request params
        const itineraries = await Itinerary.findByTourGuide(tourGuideId);
        if (!itineraries || itineraries.length === 0) {
            return res.status(404).json({ message: 'No itineraries found for this tour guide.' });
        }
        res.status(200).json(itineraries);
    } catch (error) {
        res.status(500).json({ message: 'An error occurred', error });
    }
};


module.exports = {  
    updateTourGuide,
    getTourGuideProfile,
    getItinerariesByTourGuide
};
