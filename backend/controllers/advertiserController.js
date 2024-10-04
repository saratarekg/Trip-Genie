const Advertiser = require('../models/advertiser');
const Activity = require('../models/activity');
const { deleteActivity } = require('./activityController');


const deleteAdvertiserAccount = async (req, res) => {
    try {
        const advertiser = await Advertiser.findByIdAndDelete(req.params.id);
        if (!advertiser) {
            return res.status(404).json({ message: 'Advertiser not found' });
        }

        // Find all activities associated with the advertiser
        const activities = await Activity.find({ advertiser: req.params.id });

        // Call the deleteActivity method for each activity associated with the advertiser
        for (const activity of activities) {
            await deleteActivity({ params: { id: activity._id } }, res);
        }

        res.status(201).json({ message: 'Advertiser and associated activities deleted' });
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
        const advertiser1 = await Advertiser.findById(res.locals.user_id);
        if(!advertiser1.isAccepted){
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

const getAdvertiser = async (req, res) => {
    try {
        const advertiser = await Advertiser.findById(res.locals.user_id);
        if(!advertiser.isAccepted){
            return res.status(400).json({ error: 'Advertiser is not accepted yet, Can not view profile' });
        }
        if (!advertiser) {
            return res.status(404).json({ message: 'Advertiser not found' });
        }
        res.status(200).json(advertiser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};




module.exports = { deleteAdvertiserAccount,getAllAdvertisers,getAdvertiserByID,updateAdvertiser,getAdvertiser};





