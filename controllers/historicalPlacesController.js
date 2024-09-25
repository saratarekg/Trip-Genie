const Museum = require('../models/historicalPlaces');

const createHistoricalPlace = (req, res) => {
    const museum = new Museum(req.body);

    museum.save()
        .then((result) => {
            res.status(201).json({ museum: result });
        })
        .catch((err) => {
            res.status(400).json({message: err.message})
            console.log(err);
        });
}

const getHistoricalPlace = async (req, res) => {
    try {
        const museum = await Museum.findById(req.params.id);
        res.status(200).json(museum);
    } catch (error) {
         res.status(404).json({ message: 'Place not found' });
        
    }
};

const getAllHistoricalPlaces = async (req, res) => {
    try {
        const museum = await Museum.find();
        res.status(200).json(museum);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


const updateHistoricalPlace = async (req, res) => {
    try {
        const museum= await Museum.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.status(200).json(museum);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};



const deleteHistoricalPlace= async (req, res) => {
    try {
        const museum = await Museum.findByIdAndDelete(req.params.id);
        res.status(201).json({ message: 'Place deleted' });
    } catch (error) {
         res.status(404).json({ message: 'Place not found' });
    }
};


module.exports = { createHistoricalPlace,getHistoricalPlace,getAllHistoricalPlaces,updateHistoricalPlace, deleteHistoricalPlace };