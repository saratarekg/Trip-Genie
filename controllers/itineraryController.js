const Itinerary = require('../models/itinerary');

// GET all itineraries
const getAllItineraries = async (req, res) => {
    try {
        const itineraries = await Itinerary.find();
        res.status(200).json(itineraries);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET a single itinerary
const getItineraryById = async (req, res) => {
    try {
        const itinerary = await Itinerary.findById(req.params.id);
        if (!itinerary) {
            return res.status(404).json({ message: 'Itinerary not found' });
        }
        res.status(200).json(itinerary);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// POST a new itinerary
const createItinerary = async (req, res) => {
    const {title, description, activities, language, price, availableDates, accessibility, pickUpLocation, dropOffLocation} = req.body;
    const itinerary = new Itinerary({title, description, activities, language, price, availableDates, accessibility, pickUpLocation, dropOffLocation, tourGuide:res.locals.user_id});

    try {
        await itinerary.save();
        res.status(201).json(itinerary);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// // DELETE a single itinerary
// const deleteItinerary = async (req, res) => {
//     try {
//         const itinerary = await Itinerary.findByIdAndDelete(req.params.id);
//         if (!itinerary) {
//             return res.status(404).json({ message: 'Itinerary not found' });
//         }
//         res.status(204).json();
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

// Update a single itinerary
const updateItinerary = async (req, res) => {
    try {
        const itinerary = await Itinerary.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!itinerary) {
            return res.status(404).json({ message: 'Itinerary not found' });
        }
        res.status(200).json(itinerary);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
const filterItineraries = async (req, res) => {
    try {
        
        const { price , date, preferences, language } = req.body;

        // Build the query object
        let query = {};

        if (price) {
            query.price = { $lte: price }; // Less than or equal to the specified budget
        }

        if (date) {
            query.availableDates = { 
                $elemMatch: { date: new Date(date) }
            };
        }

        // Filter by preferences (assumed to be an array of activity types)
        if (preferences) {
            const preferenceArray = preferences.split(','); // Example: preferences=beach,shopping
            query.activities = { $in: preferenceArray }; // Match any of the provided preferences
        }

        if (language) {
            query.language = language;
        }

        // Execute the query
        const itineraries = await Itinerary.find(query).populate('activities').populate('tourGuide');
       
        if (!itineraries) {
            return res.status(404).json({ message: 'Itinerary not found' });
        }

        
        res.json(itineraries);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteItinerary = async (req, res) => {
    try {
        const tourGuideId = res.locals.user_id;  // Get the current tour guide's ID

        // Find the itinerary by ID
        const itinerary = await Itinerary.findById(req.params.id);
        console.log(tourGuideId)

        if (!itinerary) {
            return res.status(404).json({ message: 'Itinerary not found' });
        }

        // Check if the itinerary belongs to the current tour guide
        if (itinerary.tourGuide.toString() !== tourGuideId) {
            return res.status(403).json({ message: 'Unauthorized: You can only delete your own itineraries' });
        }

        // Check if the itinerary is booked
        if (itinerary.isBooked) {
            return res.status(400).json({ message: 'Itinerary cannot be deleted as it is already booked' });
        }

        // If all checks pass, delete the itinerary
        await Itinerary.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: 'Itinerary deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Function to get all itineraries for a specific tour guide
const getItinerariesByTourGuide = async (req, res) => {
    try {
        const  tourGuideId  = res.locals.user_id; // Assuming tourGuideId is passed in the request params
        const itineraries = await Itinerary.findByTourGuide(tourGuideId);
        if (!itineraries || itineraries.length === 0) {
            return res.status(404).json({ message: 'No itineraries found for this tour guide.' });
        }
        res.status(200).json(itineraries);
    } catch (error) {
        res.status(500).json({ message: 'An error occurred', error });
    }
};

const searchItineraries = async (req, res) => {
    try {
        const { searchBy } = req.body;
        const itineraries = await Itinerary.findByFields(searchBy);
        if (!itineraries || itineraries.length === 0) {
            return res.status(404).json({ message: 'No itineraries found.' });
        }
        res.status(200).json(itineraries);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllItineraries,
    getItineraryById,
    createItinerary,
    deleteItinerary,
    updateItinerary,
    filterItineraries,
    getItinerariesByTourGuide,
    searchItineraries
};
