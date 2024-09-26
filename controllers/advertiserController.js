const Advertiser = require('../models/advertiser');
const activity = require('../models/activity');


const deleteAdvertiserAccount = async (req, res) => {
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

const getAllAdvertisers = async (req, res) => {
    try {
        const advertiser = await Advertiser.find();
        res.status(200).json(advertiser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getAdvertiserByID = async (req, res) => {
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

const updateAdvertiser = async (req, res) => {
    try {
        const advertiser1 = await Advertiser.findById(req.params.id);
        if(!advertiser1.accepted){
            return res.status(400).json({ error: 'Advertiser is not accepted yet, Can not update profile' });
        }
        
        const advertiser = await Advertiser.findByIdAndUpdate(req.params.id, req.body, { new: true,runValidators:true});



        if (!advertiser) {
            return res.status(404).json({ error: 'Advertiser not found' });
        }
        res.status(200).json({ message: 'Advertiser profile updated', advertiser });
    } catch (error) {
        console.log(error);
        res.status(400).json({ error: 'Error updating advertiser profile' });
    }
};


const getActivitiesByAdvertisor = async (req, res) => {
    try {
        const { advertisorID } = req.params; // Assuming touristId is passed in the request params
        const activities = await activity.findByAdvertisor(advertisorID);
        if (!activities || activities.length === 0) {
            return res.status(404).json({ message: 'No activities found for this advertisor.' });
        }
        res.status(200).json(activities);
    } catch (error) {
        res.status(500).json({ message: 'An error occurred', error });
    }
};

module.exports = { deleteAdvertiserAccount,getAllAdvertisers,getAdvertiserByID,getActivitiesByAdvertisor,updateAdvertiser};