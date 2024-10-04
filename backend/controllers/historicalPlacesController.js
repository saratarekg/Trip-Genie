const Museum = require('../models/historicalPlaces');


const createHistoricalPlace = async (req, res) => {
    const {title, description, location,  historicalTag, openingHours, ticketPrices, pictures} = req.body;
    const historicalPlace = new Museum({title,description, location,  historicalTag, openingHours, ticketPrices, pictures, governor:res.locals.user_id});

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
    console.log("I am above all");
    try {
        console.log("I am here");
        const { types,periods,myPlaces, searchBy } = req.query;
        const filterResult = await Museum.filterByTag(types,periods);
        console.log("I am below filter but not search");

        const searchResult = await Museum.findByFields(searchBy);

        console.log("I am below filter and search");
        const searchResultIds = searchResult.map((place) => place._id);
        const filterResultIds = filterResult.map((place) => place._id);
        const query = [];
        query.push({ _id: { $in: searchResultIds }}, {_id: { $in: filterResultIds }});
        if(myPlaces==='true'){
            query.push({ governor: res.locals.user_id });
        }

        const historicalPlaces = await Museum.find({
        $and: query,
        }).populate('historicalTag').exec();
        if (!historicalPlaces || historicalPlaces.length === 0) {
            return res.status(404).json({ message: 'No historical places found.' });
        }
        res.status(200).json(historicalPlaces);
    } catch (error) {
        res.status(500).json({ error: error.message });
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
        const { types,periods } = req.body;
        // console.log(types,periods);
        const filterResult = await Museum.filterByTag(types,periods);
        const searchResult = await Museum.findByFields(searchBy);

        const searchResultIds = searchResult.map((place) => place._id);
        const filterResultIds = filterResult.map((place) => place._id);

        const historicalPlaces = await Museum.find({
        $and: [{ _id: { $in: searchResultIds }}, {_id: { $in: filterResultIds }} ],
        });
        if (!historicalPlaces || historicalPlaces.length === 0) {
            return res.status(404).json({ message: 'No historical places found.' });
        }
        res.status(200).json(historicalPlaces);
    } catch (error) {
        res.status(500).json({ error: error.message });
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

module.exports = { createHistoricalPlace,getHistoricalPlace,getAllHistoricalPlaces,updateHistoricalPlace, deleteHistoricalPlace,filterHistoricalPlaces,getHistoricalPlacesByGovernor};