const TourGuide = require('../models/tourGuide');

const tourGuideSignup = (req, res) => {
    const {username, email, password} = req.body;
    const tourGuide = new TourGuide({username, email, password});

    tourGuide.save()
        .then((result) => {
            res.status(201).json({ tourGuide: result });
        })
        .catch((err) => {
            console.log(err);
            res.status(400).json({ message: err.message });
        });
}

const deleteTourGuideAccount = async (req, res) => {
    try {
        const tourGuide = await TourGuide.findByIdAndDelete(req.params.id);
        if (!tourGuide) {
            return res.status(404).json({ message: 'TourGuide not found' });
        }
        res.status(201).json({ message: 'TourGuide deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getAllTourGuides = async (req, res) => {
    try {
        const tourGuide = await TourGuide.find();
        res.status(200).json(tourGuide);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getTourGuideByID = async (req, res) => {
    try {
        const tourGuide = await TourGuide.findById(req.params.id);
        if (!tourGuide) {
            return res.status(404).json({ message: 'Tour Guide not found' });
        }
        res.status(200).json(tourGuide);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
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

module.exports = { 
    tourGuideSignup, 
    deleteTourGuideAccount, 
    getAllTourGuides, 
    getTourGuideByID, 
    updateTourGuide 
};
