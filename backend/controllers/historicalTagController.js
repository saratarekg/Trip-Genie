const HistoricalTag = require('../models/historicalTags');

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





module.exports = {addHistoricalTag};