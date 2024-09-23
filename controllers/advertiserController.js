const Advertiser = require('../models/advertiser');

const advertiserSignup = (req, res) => {
    const {username, email, password} = req.body;
    const advertiser = new Advertiser({username, email, password});

    advertiser.save()
        .then((result) => {
            res.status(201).json({ advertiser: result });
        })
        .catch((err) => {
            console.log(err);
            res.status(400).json({ message: err.message });
        });
}

module.exports = {advertiserSignup};