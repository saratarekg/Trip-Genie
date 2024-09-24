const TourGuide = require('../models/tourGuide');


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
module.exports = { deleteTourGuideAccount, getAllTourGuides, getTourGuideByID};