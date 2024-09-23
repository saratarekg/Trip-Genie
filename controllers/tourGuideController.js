const TourGuide = require('../models/tourGuide');

const tourGuideSignup = (req, res) => {
    const {username, email, password} = req.body;
    const tourGuide = new TourGuide({username, email, password});

    tourGuide.save()
        .then((result) => {
            res.status(201).json({ tourGuide: result });
        })
        .catch((err) => {
            console.log(err);
            res.status(400).json({ message: err.message });
        });
}

module.exports = {tourGuideSignup};