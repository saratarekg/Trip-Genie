const Museum = require('../models/historicalPlaces');

// const createHistoricalPlace = (req, res) => {
//     const museum = new Museum(req.body);

//     museum.save()
//         .then((result) => {
//             res.status(201).json({ museum: result });
//         })
//         .catch((err) => {
//             res.status(400).json({message: err.message})
//             console.log(err);
//         });
// }

const createHistoricalPlace = async (req, res) => {
    const { description, location,  historicalTag, openingHours, ticketPrices, pictures} = req.body;
    const historicalPlace = new Museum({description, location,  historicalTag, openingHours, ticketPrices, pictures, governor:res.locals.user_id});

    try {
        await historicalPlace.save();
        res.status(201).json(historicalPlace);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


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
        const historicalPlaces = await Museum.findByTag(req.body.historicalTags);
        //const { historicalTag } = req.body;

        // // Build the query object
        // let query = {};

        // // Filter by historical tags
        // for(const historicalTag of historicalTagsArray) {
        //     const query = await Museum.search({ historicalTag: { $in: historicalTag } });
            // console.log('yarabbb2');

            // // const historicalTagsArray = JSON.parse(historicalTag); 
            // console.log('yarabbb0');
            // // Assuming historicalTag is a JSON string
            // const types = historicalTagsArray.map(historicalTag => historicalTag.type); // Extracting types
            // const periods = historicalTagsArray.map(historicalTag => historicalTag.period); // Extracting periods
            // console.log('big if');

            // // Use both types and periods for filtering
            // if (types.length > 0) {
            //     query.type = { $in: types }; // Match any of the provided types
            //     console.log('types if');
            // }

            // if (periods.length > 0) {
            //     // Assuming you have a period field in your Museum model
            //     query.period = { $in: periods }; // Match any of the provided periods
            //     console.log('period if');
            // }
        // }
        

        // Execute the query
        // const historicalPlaces = await Museum.find(query)
        //     .populate('governor')
        //     .populate('historicalTag');
        console.log(historicalPlaces);
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
        const  governorId  = res.locals.user_id; // Assuming governorId is passed in the request params
        const historicalPlaces = await Museum.findByGovernor(governorId);
        if (!historicalPlaces || historicalPlaces.length === 0) {
            return res.status(404).json({ message: 'No historical places found for this governor.' });
        }
        res.status(200).json(historicalPlaces);
    } catch (error) {
        res.status(500).json({  error: error.message });
    }
};

const searchHistoricalPlaces = async (req, res) => {
    try {
        const { searchBy } = req.body;
        const historicalPlaces = await Museum.findByFields(searchBy);
        if (!historicalPlaces || historicalPlaces.length === 0) {
            return res.status(404).json({ message: 'No historical places found.' });
        }
        res.status(200).json(historicalPlaces);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { createHistoricalPlace,getHistoricalPlace,getAllHistoricalPlaces,updateHistoricalPlace, deleteHistoricalPlace,filterHistoricalPlaces,getHistoricalPlacesByGovernor, searchHistoricalPlaces};