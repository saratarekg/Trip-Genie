const TourismGovernor = require('../models/tourismGovernor');

const addTourismGovernor = (req, res) => {
    const tourismGovernor = new TourismGovernor(req.body);

    tourismGovernor.save()
        .then((result) => {
            res.status(201).json({ tourismGovernor: result });
        })
        .catch((err) => {
            res.status(400).json({message: err.message})
            console.log(err);
        });
}

module.exports = {addTourismGovernor};