const Tourist = require('../models/tourist');

const touristSignup = (req, res) => {
    const tourist = new Tourist(req.body);

    tourist.save()
        .then((result) => {
            res.status(201).json({ tourist: result });
        })
        .catch((err) => {
            res.status(400).json({ message: err.message });
            console.log(err);
        });
}

module.exports = {touristSignup};