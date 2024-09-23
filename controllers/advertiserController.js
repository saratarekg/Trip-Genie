const Advertiser = require('../models/advertiser');

const advertiserSignup = (req, res) => {
    const {username, email, password} = req.body;
    const advertiser = new Advertiser({username, email, password});

    advertiser.save()
        .then((result) => {
            res.status(201).json({ advertiser: result });
        })
        .catch((err) => {
            console.log(err);
            res.status(400).json({ message: err.message });
        });
}

const adminDeleteAdvertiserAccount = async (req, res) => {
    try {
        const advertiser = await Advertiser.findByIdAndDelete(req.params.id);
        if (!advertiser) {
            return res.status(404).json({ message: 'Advertiser not found' });
        }
        res.status(201).json({ message: 'Advertiser deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const adminGetAllAdvertisers = async (req, res) => {
    try {
        const advertiser = await Advertiser.find();
        res.status(200).json(advertiser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const adminGetAdvertiserByID = async (req, res) => {
    try {
        const advertiser = await Advertiser.findById(req.params.id);
        if (!advertiser) {
            return res.status(404).json({ message: 'Advertiser not found' });
        }
        res.status(200).json(advertiser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {advertiserSignup, adminDeleteAdvertiserAccount,adminGetAllAdvertisers,adminGetAdvertiserByID};