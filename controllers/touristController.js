const Tourist = require('../models/tourist');


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
module.exports = {deleteTouristAccount,getAllTourists,getTouristByID};