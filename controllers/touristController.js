const Tourist = require('../models/tourist');

const touristSignup = (req, res) => {
    const tourist = new Tourist(req.body);

    tourist.save()
        .then((result) => {
            res.status(201).json({ tourist: result });
        })
        .catch((err) => {
            res.status(400).json({ message: err.message });
            console.log(err);
        });
}

const adminDeleteTouristAccount = async (req, res) => {
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

const adminGetAllTourists = async (req, res) => {
    try {
        const tourist = await Tourist.find();
        res.status(200).json(tourist);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const adminGetTouristByID = async (req, res) => {
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
module.exports = {touristSignup, adminDeleteTouristAccount,adminGetAllTourists,adminGetTouristByID};