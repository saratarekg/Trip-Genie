const Tourist = require('../models/tourist');
const activity = require('../models/activity');


const filterActivities = async (req, res) => {
    try {
        const { budget, startDate, endDate, category, minRating } = req.query;

        // Build the query object
        let query = {
            'timeline.start': { $gte: new Date() } // Only upcoming activities
        };

        if (budget) {
            query.price = { $lte: budget };
        }

        if (startDate) {
            query['timeline.start'] = { ...query['timeline.start'], $gte: new Date(startDate) };
        }

        if (endDate) {
            query['timeline.end'] = { ...query['timeline.end'], $lte: new Date(endDate) };
        }

        if (category) {
            query.category = category;
        }

        if (minRating) {
            query.rating = { $gte: minRating }; // Assuming you have a rating field
        }

        const activities = await activity.find(query).populate('category tags');

        res.status(200).json(activities);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteTouristAccount = async (req, res) => {
    try {
        const tourist = await Tourist.findByIdAndDelete(req.params.id);
        if (!tourist) {
            return res.status(404).json({ message: 'Tourist not found' });
        }
        res.status(201).json({ message: 'Tourist deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getAllTourists = async (req, res) => {
    try {
        const tourist = await Tourist.find();
        res.status(200).json(tourist);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getTouristByID = async (req, res) => {
    try {
        const tourist = await Tourist.findById(req.params.id);
        if (!tourist) {
            return res.status(404).json({ message: 'Tourist not found' });
        }
        res.status(200).json(tourist);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getTourist = async (req, res) => {
    try {
        const tourist = await Tourist.findById(res.locals.user_id);
        if (!tourist) {
            return res.status(404).json({ message: 'Tourist not found' });
        }
        res.status(200).json(tourist);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateTourist = async (req, res) => {
    try {
        const tourist = await Tourist.findByIdAndUpdate(res.locals.user_id);
        if (!tourist) {
            return res.status(404).json({ message: 'Tourist not found' });
        }
        res.status(200).json(tourist);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {deleteTouristAccount,getAllTourists,getTouristByID,getTourist,updateTourist,filterActivities};