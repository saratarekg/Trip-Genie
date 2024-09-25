const TourismGovernor = require('../models/tourismGovernor');
const Admin = require('../models/admin');

const addTourismGovernor = async (req, res) => {
    try{
        if(await usernameExists(req.body.username)){
            throw new Error('Username already exists');
        }

        console.log('hereeeee');

        const tourismGovernor = new TourismGovernor(req.body);

        console.log('hereeeee1');

        tourismGovernor.save()
            .then((result) => {
                res.status(201).json({ tourismGovernor: result });
            })
            .catch((err) => {
                res.status(400).json({message: err.message})
                console.log(err);
            });
    }
    catch(err){
        console.log("here");
        res.status(400).json({message: err.message});
    }
}

const deleteTourismGovAccount = async (req, res) => {
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

const getAllTourismGov = async (req, res) => {
    try {
        const tourismGov = await TourismGovernor.find();
        res.status(200).json(tourismGov);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getTourismGovByID = async (req, res) => {
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

const usernameExists = async (username) => {
    if(await Admin.findOne({username})){
        return true;
    }
    else if(await TourismGovernor.findOne({username})){
        return true;
    }
    else{
        return false;
    }
}

module.exports = {addTourismGovernor, getTourismGovByID, getAllTourismGov, deleteTourismGovAccount};