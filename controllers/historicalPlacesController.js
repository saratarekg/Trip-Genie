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

const filterHistoricalPlaces = async (req, res) => {
    try {
        const historicalTag = req.body.historicalTag;
        //const { historicalTag } = req.body;

        // Build the query object
        let query = {};

        // Filter by historical tags
        if (historicalTag) {
            const historicalTagsArray = JSON.parse(historicalTag); // Assuming historicalTag is a JSON string
            const types = historicalTagsArray.map(historicalTag => historicalTag.type); // Extracting types
            const periods = historicalTagsArray.map(historicalTag => historicalTag.period); // Extracting periods
            console.log('big if');

            // Use both types and periods for filtering
            if (types.length > 0) {
                query.type = { $in: types }; // Match any of the provided types
                console.log('types if');
            }

            if (periods.length > 0) {
                // Assuming you have a period field in your Museum model
                query.period = { $in: periods }; // Match any of the provided periods
                console.log('period if');
            }
        }
        

        // Execute the query
        const historicalPlaces = await Museum.find(query)
            .populate('governor')
            .populate('historicalTag');

        if (!historicalPlaces || historicalPlaces.length === 0) {
            return res.status(404).json({ message: 'Historical place not found' });
        }

        res.json(historicalPlaces);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getHistoricalPlacesByGovernor = async (req, res) => {
    try {
        const  governorId  = req.params; // Assuming governorId is passed in the request params
        const historicalPlaces = await HistoricalPlace.findByGovernor(governorId);
        if (!historicalPlaces || historicalPlaces.length === 0) {
            return res.status(404).json({ message: 'No historical places found for this governor.' });
        }
        res.status(200).json(historicalPlaces);
    } catch (error) {
        res.status(500).json({ message: 'An error occurred', error });
    }
};

module.exports = { createHistoricalPlace,getHistoricalPlace,getAllHistoricalPlaces,updateHistoricalPlace, deleteHistoricalPlace,filterHistoricalPlaces,getHistoricalPlacesByGovernor };