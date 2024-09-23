const TourismGovernor = require('../models/tourismGovernor');

const addTourismGovernor = (req, res) => {
    const tourismGovernor = new TourismGovernor(req.body);

    tourismGovernor.save()
        .then((result) => {
            res.status(201).json({ tourismGovernor: result });
        })
        .catch((err) => {
            res.status(400).json({message: err.message})
            console.log(err);
        });
}

const adminDeleteTourismGovAccount = async (req, res) => {
    try {
        const tourismGov = await TourismGovernor.findByIdAndDelete(req.params.id);
        if (!tourismGov) {
            return res.status(404).json({ message: 'Tourism Governor not found' });
        }
        res.status(201).json({ message: 'Tourism Governor deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const adminGetAllTourismGov = async (req, res) => {
    try {
        const tourismGov = await TourismGovernor.find();
        res.status(200).json(tourismGov);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const adminGetTourismGovByID = async (req, res) => {
    try {
        const tourismGov = await TourismGovernor.findById(req.params.id);
        if (!tourismGov) {
            return res.status(404).json({ message: 'Tourism Governor not found' });
        }
        res.status(200).json(tourismGov);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {addTourismGovernor, adminGetTourismGovByID, adminGetAllTourismGov, adminDeleteTourismGovAccount};