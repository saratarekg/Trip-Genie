const HistoricalTag = require('../models/historicalTags');
const HistoricalPlace = require('../models/historicalPlaces');

const addHistoricalTag = (req, res) => {
    const historicalTag = new HistoricalTag(req.body);

    historicalTag.save()
        .then((result) => {
            res.status(201).json({ historicalTag: result });
        })
        .catch((err) => {
            res.status(400).json({message: err.message})
            console.log(err);
        });
}

const deleteTag = async (req, res) => {
    try {
        // Delete the tag
        const tag = await HistoricalTag.findByIdAndDelete(req.params.id);
        if (!tag) {
            return res.status(404).json({ message: 'Tag not found' });
        }

        // Remove the deleted tag from the 'tags' array in Activity model
        await HistoricalPlace.updateMany(
            { historicalTag: req.params.id }, // Find activities with this tag
            { $pull: { historicalTag: req.params.id } } // Remove the tag from the array
        );

        res.status(200).json({ message: 'Tag deleted and removed from historical places' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


const getAlltags = async (req, res) => {
    try {
        const tag = await HistoricalTag.find();
        res.status(200).json(tag);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
const getAllHistoricalTypes = async (req, res) => {
    
    try {
        const tag = await HistoricalTag.find();
        const types = tag.map((HistoricalTag) => HistoricalTag.type);
        res.status(200).json(types);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
const getAllHistoricalPeriods = async (req, res) => {
    
    try {
        const tag = await HistoricalTag.find();
        const types = tag.map((HistoricalTag) => HistoricalTag.period);
        res.status(200).json(types);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = {addHistoricalTag,deleteTag,getAlltags,getAllHistoricalTypes,getAllHistoricalPeriods};